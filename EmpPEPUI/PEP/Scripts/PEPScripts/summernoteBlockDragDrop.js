/**
 * Blocks native drag-and-drop into Summernote (.note-editor) across the app.
 * Runs once; capture phase so it wins over Summernote's handlers.
 * Also removes the extra line some browsers/extensions append to the drag/drop security notice.
 *
 * Other ways to keep images out of Summernote (use together for defense in depth):
 * 1. Summernote option `disableDragAndDrop: true` (built-in; still pair with this file for file drops).
 * 2. Toolbar: do not include the `picture` / image button so users cannot open the image picker.
 * 3. `callbacks.onPaste`: paste plain text only (blocks pasted HTML and pasted images from rich clipboard).
 * 4. `callbacks.onImageUpload`: define and do not call `insertImage` — blocks the toolbar upload path if image is ever enabled.
 * 5. Server-side: sanitize stored HTML and strip `<img>` (strongest; client checks can be bypassed).
 *
 * Reuse image-blocking callbacks on each `.summernote({ ... })` init:
 *   callbacks: $.extend({}, (window.pepSummernoteBlockImagesCallbacks || function(){return{};})(), { onInit: ... })
 */
(function () {
    if (window.__pepBlockSummernoteDnD) {
        return;
    }
    window.__pepBlockSummernoteDnD = true;

    function isInsideSummernoteEditor(target) {
        return target && typeof target.closest === 'function' && target.closest('.note-editor');
    }

    function blockIfSummernote(e) {
        if (isInsideSummernoteEditor(e.target)) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    ['dragenter', 'dragover', 'drop'].forEach(function (type) {
        document.addEventListener(type, blockIfSummernote, true);
    });

    /**
     * Ctrl+V screenshot / image file: clipboard has image/* or Files, often with no text/plain.
     * Summernote/browser default runs unless we stop paste in capture phase before other handlers.
     */
    function clipboardHasImageOrFilePaste(cd) {
        if (!cd) {
            return false;
        }
        var items = cd.items;
        if (items && items.length) {
            for (var i = 0; i < items.length; i++) {
                var it = items[i];
                if (!it) {
                    continue;
                }
                if (it.kind === 'file') {
                    return true;
                }
                if (it.type && String(it.type).indexOf('image/') === 0) {
                    return true;
                }
            }
        }
        var types = cd.types;
        if (types && types.length) {
            for (var j = 0; j < types.length; j++) {
                if (types[j] === 'Files') {
                    return true;
                }
            }
        }
        return false;
    }

    window.pepClipboardHasImageOrFilePaste = clipboardHasImageOrFilePaste;

    function isPasteTargetInsideSummernoteEditor(target) {
        return target && typeof target.closest === 'function' && target.closest('.note-editor .note-editable');
    }

    document.addEventListener('paste', function (e) {
        if (!isPasteTargetInsideSummernoteEditor(e.target)) {
            return;
        }
        if (!clipboardHasImageOrFilePaste(e.clipboardData)) {
            return;
        }
        e.preventDefault();
        if (typeof e.stopImmediatePropagation === 'function') {
            e.stopImmediatePropagation();
        }
        e.stopPropagation();
    }, true);

    // Not in our bundle; often injected with the first line — strip the follow-up sentence only.
    var secondLineRe = /\s*Please use the file (?:upload|ipload) option instead\.?\s*/gi;
    var secondLineOnlyRe = /^\s*Please use the file (?:upload|ipload) option instead\.?\s*$/i;

    function scrubTextNode(node) {
        var v = node.nodeValue;
        if (!v || v.indexOf('Please use the file') === -1) {
            return;
        }
        if (secondLineOnlyRe.test(v)) {
            node.nodeValue = '';
            return;
        }
        var next = v.replace(secondLineRe, '').replace(/\r\n/g, '\n').replace(/\n\s*\n+/g, '\n').trim();
        if (next !== v) {
            node.nodeValue = next;
        }
    }

    function removeStandaloneSecondLineElements(root) {
        if (!root || !root.querySelectorAll) {
            return;
        }
        var nodes = root.querySelectorAll('p, div, span, li, td, h1, h2, h3, h4, h5, h6');
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            if (el.children.length) {
                continue;
            }
            var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (secondLineOnlyRe.test(t) && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }
    }

    function scrubDragDropUploadLine(root) {
        root = root || document.body;
        if (!root) {
            return;
        }
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        var n;
        while ((n = walker.nextNode())) {
            scrubTextNode(n);
        }
        removeStandaloneSecondLineElements(root);
    }

    var scrubScheduled = false;
    function scheduleScrub() {
        if (scrubScheduled) {
            return;
        }
        scrubScheduled = true;
        requestAnimationFrame(function () {
            scrubScheduled = false;
            scrubDragDropUploadLine(document.body);
        });
    }

    function startScrubObserver() {
        if (!document.body) {
            return;
        }
        scrubDragDropUploadLine(document.body);
        try {
            var mo = new MutationObserver(scheduleScrub);
            mo.observe(document.body, { childList: true, subtree: true });
        } catch (e) { /* IE or restricted context */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startScrubObserver);
    } else {
        startScrubObserver();
    }
})();

/**
 * Paste handler: plain text only. Strips HTML (so pasted pages with &lt;img&gt; do not embed images).
 * Use in Summernote callbacks.onPaste and/or call after this script loads.
 */
window.pepSummernoteOnPastePlainTextOnly = function (e) {
    var ev = e && (e.originalEvent || e);
    var cd = (ev && ev.clipboardData) || window.clipboardData;
    if (ev && ev.preventDefault) {
        ev.preventDefault();
    }
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    if (!cd) {
        return;
    }
    if (window.pepClipboardHasImageOrFilePaste && window.pepClipboardHasImageOrFilePaste(cd)) {
        return;
    }

    var plain = (cd.getData('text/plain') || cd.getData('Text') || '').replace(/\r\n/g, '\n');
    if (!plain.trim()) {
        var html = cd.getData('text/html') || '';
        if (html) {
            plain = ($('<div>').html(html).text() || '').replace(/\r\n/g, '\n');
        }
    }
    if (!plain) {
        return;
    }

    if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, plain);
    } else {
        var sel = window.getSelection();
        if (sel && sel.rangeCount) {
            var r = sel.getRangeAt(0);
            r.deleteContents();
            r.insertNode(document.createTextNode(plain));
            r.collapse(false);
        }
    }
};

/**
 * Optional callbacks to merge into Summernote `callbacks` — paste as text only; ignore image uploads.
 * Does not replace drag/drop blocking (handled above).
 */
window.pepSummernoteBlockImagesCallbacks = function () {
    return {
        onPaste: function (e) {
            window.pepSummernoteOnPastePlainTextOnly(e);
        },
        onImageUpload: function () {
            /* Defined so Summernote does not fall back to embedding dropped/picked files as base64. */
        }
    };
};
