// =============================================
// Manager Feedback Cards - Redesigned UI
// =============================================

// Full-page loader (#managerFeedbackPageLoader) wired from AddManagersFeedback.js — hide when cards/data finish loading
function mfManagerFeedbackHidePageLoader() {
    if (typeof window.hideManagerFeedbackPageLoader === 'function') {
        window.hideManagerFeedbackPageLoader();
    }
}
function mfManagerFeedbackShowPageLoader(message) {
    if (typeof window.showManagerFeedbackPageLoader === 'function') {
        window.showManagerFeedbackPageLoader(message || 'Loading...');
    }
}

var ManagerFeedbackCards = {
    goals: [],
    drafts: {},
    currentCardIndex: 0,
    feedbacks: {}, // Store all feedbacks with goal data
    isSubmitting: false,
    isExpandAllMode: false, // Track if Expand All is active
    expandedCards: [], // Track which cards are expanded
    autosaveTimers: {}, // Track autosave timers per textarea
    autosaveBound: false, // Track if autosave is already bound
    selfAssessmentAttachments: {}, // Store attachments by KRAId: { KRAId: [attachments] }
    
    // Initialize
    init: function() {
        var self = this;
        this.bindEvents();
        
        // Hide old table view if it exists
        $('#tblManagerFeedbackKRAList').closest('.bottom-padding').hide();
        $('#tblManagerFeedbackKRAList').hide();
        $('#BtnFeedbackSaveSubmit').hide();
        
        // Load goals and drafts
        this.loadGoalsAndDrafts();
        
        // Also hide old table on tab switch
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if ($(e.target).attr("href") === "#tab_b") {
                $('#tblManagerFeedbackKRAList').closest('.bottom-padding').hide();
                $('#tblManagerFeedbackKRAList').hide();
                $('#BtnFeedbackSaveSubmit').hide();
            }
        });
    },
    
    // Bind event handlers
    bindEvents: function() {
        var self = this;
        
        // Expand All button
        $(document).on('click', '#btnExpandAll', function(e) {
            e.preventDefault();
            self.expandAll();
        });
        
        // Collapse All button
        $(document).on('click', '#btnCollapseAll', function(e) {
            e.preventDefault();
            self.collapseAll();
        });
        
        // Download All Self Assessment Attachments button
        $(document).on('click', '#btnDownloadAllSelfAssessmentAttachments', function(e) {
            e.preventDefault();
            self.downloadAllSelfAssessmentAttachments();
        });
        
        // Save Draft button - prevent event bubbling and stop old handlers
        $(document).on('click', '#btnSaveDraft', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation(); // Stop other handlers from firing
            
            // Only proceed if ManagerFeedbackCards is active
            if (self.goals && self.goals.length > 0) {
                self.saveAllDrafts();
            }
        });
        
        // Submit Feedback button (always visible at bottom)
        $('#btnSubmitFeedback').on('click', function() {
            self.showSummaryAndSubmit();
        });
        
        // Card header click - expand/collapse
        $(document).on('click', '.goal-card-header', function(e) {
            // Don't trigger if clicking on buttons inside header
            if ($(e.target).is('button') || $(e.target).closest('button').length) {
                return;
            }
            
            var $card = $(this).closest('.goal-card');
            var index = parseInt($card.data('index'));
            self.toggleCard(index);
        });
        
        // Next Goal button
        $(document).on('click', '.btn-next-goal', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = parseInt($(this).data('index'));
            self.navigateToNextGoal(index - 1); // Pass current index
        });
        
        // Previous Goal button
        $(document).on('click', '.btn-previous-goal', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = parseInt($(this).data('index'));
            self.navigateToPreviousGoal(index + 1); // Pass current index
        });
    },
    
    // Helper function to get feedback from textarea (handles both regular textarea and Summernote)
    getFeedbackFromTextarea: function($textarea) {
        var feedback = '';
        
        // Check if Summernote is initialized
        if ($textarea.data('summernote') && typeof $.fn.summernote !== 'undefined') {
            try {
                if ($textarea.summernote('isEmpty')) {
                    return '';
                }
                feedback = $textarea.summernote('code');
            } catch (e) {
                console.warn('Error getting Summernote code, falling back to .val():', e);
                feedback = $textarea.val();
            }
        } else {
            feedback = $textarea.val();
        }
        
        return feedback;
    },
    
    /**
     * True when RM feedback is blank (no visible text). HTML-only empties such as &lt;p&gt;&lt;br&gt;&lt;/p&gt; count as blank.
     */
    isRmFeedbackContentEmpty: function (content) {
        if (content == null || content === undefined) return true;
        var s = String(content).replace(/\u200b|\ufeff/g, '');
        if (s.trim() === '') return true;
        var plain = $('<div>').html(s).text().replace(/\u00a0/g, ' ').replace(/\u200b|\ufeff/g, '').trim();
        return plain.length === 0;
    },
    
    // Get API path (fix duplicate /api/api/)
    // SERVERNAME should be like 'http://localhost:54659/api/' or 'http://localhost:54659/api'
    getApiPath: function(endpoint) {
        var svrPath = CONFIG.get('SERVERNAME');
        
        // Remove trailing slash from svrPath
        svrPath = svrPath.replace(/\/+$/, '');
        
        // Remove leading slash from endpoint
        endpoint = endpoint.replace(/^\/+/, '');
        
        // Check if /api/ already exists in svrPath
        if (svrPath.includes('/api/')) {
            // Already has /api/, just append endpoint
            return svrPath + '/' + endpoint;
        } else if (svrPath.endsWith('/api')) {
            // Ends with /api (no trailing slash), add endpoint
            return svrPath + '/' + endpoint;
        } else {
            // No /api/ found, add it
            return svrPath + '/api/' + endpoint;
        }
    },
    
    // Check if feedback is submitted
    checkFeedbackStatus: function(callback) {
        var self = this;
        var selectedyear = $('#ddlyearFeedback :selected').val();
        var empId = sessionStorage.EmployeeId;
        var appraisalCycleId = ddlAppCycle;
        var ToEmployeeId = GToEmployeeId;
        var svrPath = CONFIG.get('SERVERNAME');
        
        // Check if submitted feedback exists (StatusID != 100)
        var apiPath = svrPath + "Feedback?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + 
            "&FromEmployeeId=" + empId + "&ActionTypeId=1&ParentFeedBackId=0&AreaID=2&SelectedYear=" + selectedyear;
        
        $.ajax({
            url: apiPath,
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                'X-EmpNo': sessionStorage.EmployeeId
            },
            success: function(response) {
                if (response && response.Success) {
                    var feedbackData = response.Result;
                    // Check if any feedback has StatusID != 100 (submitted)
                    if (feedbackData && feedbackData.Tables && feedbackData.Tables[0] && feedbackData.Tables[0].Rows && feedbackData.Tables[0].Rows.length > 0) {
                        var hasSubmitted = false;
                        for (var i = 0; i < feedbackData.Tables[0].Rows.length; i++) {
                            var row = feedbackData.Tables[0].Rows[i];
                            if (row.StatusID && row.StatusID != 100) {
                                hasSubmitted = true;
                                break;
                            }
                        }
                        if (hasSubmitted) {
                            callback({ isSubmitted: true, feedbackData: feedbackData });
                            return;
                        }
                    }
                }
                callback({ isSubmitted: false });
            },
            error: function(xhr, statusText, errorThrown) {
                console.error('Error checking feedback status:', errorThrown);
                callback({ isSubmitted: false });
            },
            complete: function() {
                // Loader will be hidden in loadGoalsAndDrafts or loadSubmittedFeedback
            }
        });
    },
    
    // Load self-assessment attachments for all goals
    loadSelfAssessmentAttachments: function(callback) {
        var self = this;
        var empId = sessionStorage.EmployeeId;
        var appraisalCycleId = ddlAppCycle;
        var selectedyear = $('#ddlyearFeedback :selected').val();
        var ToEmployeeId = GToEmployeeId;
        
        if (!empId || !appraisalCycleId || !ToEmployeeId) {
            console.warn('ManagerFeedbackCards: Missing parameters for loading attachments');
            if (callback) callback();
            return;
        }
        
        // Get SelfAssessmentCycleId from selectedyear (keep as string/number for API)
        var selfAssCycleId = selectedyear ? selectedyear : null;
        
        // Log for debugging
        console.log('ManagerFeedbackCards: Loading attachments for', {
            EmployeeId: ToEmployeeId,
            AppraisalCycleId: appraisalCycleId,
            SelfAssessmentCycleId: selfAssCycleId
        });
        
        var apiPath = this.getApiPath('/EmployeeKRA/GetSelfAssessmentAttachmentsByEmployeeCycle?EmployeeId=' + ToEmployeeId + '&AppraisalCycleId=' + appraisalCycleId + (selfAssCycleId ? '&SelfAssessmentCycleId=' + selfAssCycleId : ''));
        
        $.ajax({
            url: apiPath,
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                'Content-Type': 'application/json'
            },
            success: function(response) {
                console.log('ManagerFeedbackCards: Attachment API response:', response);
                
                if (response && response.Success && response.Result) {
                    // Group attachments by KRAId
                    var attachmentsByKRA = {};
                    
                    // Handle both DataTable and array responses
                    var attachmentsList = [];
                    if (Array.isArray(response.Result)) {
                        attachmentsList = response.Result;
                    } else if (response.Result.data && Array.isArray(response.Result.data)) {
                        attachmentsList = response.Result.data;
                    } else if (response.Result.Table1 && Array.isArray(response.Result.Table1)) {
                        attachmentsList = response.Result.Table1;
                    }
                    
                    console.log('ManagerFeedbackCards: Found', attachmentsList.length, 'attachments');
                    
                    attachmentsList.forEach(function(attachment) {
                        var kraId = attachment.KRAId || attachment.kraId;
                        console.log('ManagerFeedbackCards: Processing attachment for KRAId:', kraId, attachment);
                        if (kraId) {
                            // Convert KRAId to string for consistent key lookup
                            var kraIdKey = String(kraId);
                            if (!attachmentsByKRA[kraIdKey]) {
                                attachmentsByKRA[kraIdKey] = [];
                            }
                            attachmentsByKRA[kraIdKey].push({
                                AttachmentId: attachment.AttachmentId || attachment.attachmentId,
                                OriginalFileName: attachment.OriginalFileName || attachment.originalFileName || attachment.FileName || attachment.fileName,
                                FileSize: attachment.FileSize || attachment.fileSize,
                                ContentType: attachment.ContentType || attachment.contentType
                            });
                        }
                    });
                    
                    // Store attachments in ManagerFeedbackCards object directly
                    ManagerFeedbackCards.selfAssessmentAttachments = attachmentsByKRA;
                    console.log('ManagerFeedbackCards: Loaded attachments for', Object.keys(attachmentsByKRA).length, 'goals');
                    console.log('ManagerFeedbackCards: Attachments by KRAId:', attachmentsByKRA);
                    console.log('ManagerFeedbackCards: Stored in ManagerFeedbackCards.selfAssessmentAttachments:', ManagerFeedbackCards.selfAssessmentAttachments);
                } else {
                    console.log('ManagerFeedbackCards: No attachments found or error in response', response);
                    ManagerFeedbackCards.selfAssessmentAttachments = {};
                }
                
                if (callback) callback();
            },
            error: function(xhr, status, error) {
                console.error('ManagerFeedbackCards: Error loading attachments:', error);
                ManagerFeedbackCards.selfAssessmentAttachments = {};
                if (callback) callback();
            }
        });
    },
    
    // Load goals and drafts
    loadGoalsAndDrafts: function () {
        var self = this;
        var selectedyear = $('#ddlyearFeedback :selected').val();
        var empId = sessionStorage.EmployeeId;
        var appraisalCycleId = ddlAppCycle;
        var ToEmployeeId = GToEmployeeId;
        var svrPath = CONFIG.get('SERVERNAME');
        
        // Validate required variables
        if (!selectedyear || !appraisalCycleId || !ToEmployeeId) {
            console.error('Missing required parameters:', { selectedyear: selectedyear, appraisalCycleId: appraisalCycleId, ToEmployeeId: ToEmployeeId });
            $('#feedbackLoader').hide();
            mfManagerFeedbackHidePageLoader();
            $('#goalsCardsContainer').show().html('<div class="text-center" style="padding: 40px; color: #d9534f;">Error: Missing required parameters. Please refresh the page.</div>');
            return;
        }

        mfManagerFeedbackShowPageLoader('Loading goals and feedback...');
        
        // Hide all containers initially
        $('#goalsCardsContainer').hide();
        $('#submittedFeedbackContainer').hide();
        $('#feedbackProgressContainer').hide();
        $('#stickyFooter').hide();
        // Show loader for entire load (status check + goals + drafts + attachments)
        $('#feedbackLoader').show();
        
        // Check if feedback is already submitted (with loader support)
        self.checkFeedbackStatus(function (statusCheck) {
            if (statusCheck.isSubmitted) {
                // Show submitted feedback in simple view (all goals at once, no progress bar, read-only)
                self.loadSubmittedFeedback(statusCheck.feedbackData);
                // Progress bar is already hidden above, and sticky footer is hidden
            } else {
                // Load goals
                var apiPath = svrPath + "EmployeeKRA/GetEmployeeKRA?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + "&StatusId=3&SelectedYear=" + selectedyear + "&SelfAssCycleId=" + selectedyear;
                
                $.ajax({
                    url: apiPath,
                    type: 'GET',
                    async: true,
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                        'X-EmpNo': sessionStorage.EmployeeId
                    },
                    beforeSend: function() {
                        $('#feedbackLoader').show();
                    },
                    success: function (goalsResponse) {
                        console.log(goalsResponse)
                        // Load drafts
                        var draftsApiPath = self.getApiPath('/ManagerFeedback/GetDraftFeedbacks?toEmployeeId=' + ToEmployeeId + '&performCycleCheck=' + selectedyear);
                        
                        $.ajax({
                            url: draftsApiPath,
                            type: 'GET',
                            async: true,
                            dataType: 'json',
                            headers: {
                                'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                                'X-EmpNo': sessionStorage.EmployeeId
                            },
                            success: function(draftsResponse) {
                                if (goalsResponse && goalsResponse.Success) {
                                    self.goals = goalsResponse.Result.data || [];
                                    
                                    // Process drafts
                                    if (draftsResponse && draftsResponse.Success) {
                                        var draftsList = draftsResponse.Result || [];
                                        draftsList.forEach(function(draft) {
                                            self.drafts[draft.QuestionaireId] = draft;
                                        });
                                    }
                                    
                                    // Merge draft data with goals (use draft goal data if available, else fallback to EmployeeKRA)
                                    self.mergeDraftDataWithGoals();
                                    
                                    // Initialize feedbacks object
                                    self.goals.forEach(function(goal) {
                                        self.feedbacks[goal.KRAId] = {
                                            Feedback: goal.DraftFeedback || '',
                                            GoalType: goal.GoalType,
                                            GoalDescription: goal.GoalDescription,
                                            Weightage: goal.Weightage,
                                            Measure: goal.Measure,
                                            AttachmentPath: goal.AttachmentPath,
                                            TrainingItemId: goal.TrainingItemId,
                                            TrainingRequirementName: goal.TrainingRequirementName,
                                            TrainingCategory: goal.TrainingCategory
                                        };
                                    });
                                    
                                    // Load self-assessment attachments for all goals
                                    self.loadSelfAssessmentAttachments(function() {
                                        $('#feedbackLoader').hide();
                                        mfManagerFeedbackHidePageLoader();
                                        // Render cards after attachments are loaded
                                        self.renderCards();
                                        
                                        // Show goals container
                                        $('#goalsCardsContainer').show();
                                        
                                        // Show progress bar
                                        $('#feedbackProgressContainer').show();
                                        self.updateProgressBar();
                                        
                                        // Show action buttons
                                        $('#feedbackActionButtons').show();
                                        
                                        // Show sticky footer (Submit button always visible)
                                        $('#stickyFooter').show();
                                        $('#btnSubmitFeedback').show(); // Always show submit button
                                        $('body').addClass('has-sticky-footer');
                                        
                                        // Ensure all cards are visible (not hidden)
                                        $('.goal-card').show();
                                        
                                        // Expand first card by default after a short delay to ensure DOM is ready
                                        setTimeout(function() {
                                            self.expandCard(0);
                                        }, 100);
                                        
                                        // Initialize collapse all button state
                                        $('#btnCollapseAll').prop('disabled', false);
                                        
                                        // Bind download attachment handlers
                                        self.bindAttachmentDownloadHandlers();
                                    });
                                } else {
                                    $('#feedbackLoader').hide();
                                    mfManagerFeedbackHidePageLoader();
                                    // Show error or no data message
                                    var errorMsg = '<div class="text-center" style="padding: 40px; color: #999;">No goals found for this cycle.</div>';
                                    if (goalsResponse && !goalsResponse.Success) {
                                        errorMsg = '<div class="text-center" style="padding: 40px; color: #d9534f;">Error loading goals. Please try again.</div>';
                                    }
                                    $('#goalsCardsContainer').show().html(errorMsg);
                                }
                            },
                            error: function(xhr, statusText, errorThrown) {
                                $('#feedbackLoader').hide();
                                mfManagerFeedbackHidePageLoader();
                                console.error('Error loading drafts:', errorThrown);
                                // Continue with goals even if drafts fail
                                if (goalsResponse && goalsResponse.Success) {
                                    self.goals = goalsResponse.Result.data || [];
                                    self.mergeDraftDataWithGoals();
                                    self.goals.forEach(function(goal) {
                                        self.feedbacks[goal.KRAId] = {
                                            Feedback: goal.DraftFeedback || '',
                                            GoalType: goal.GoalType,
                                            GoalDescription: goal.GoalDescription,
                                            Weightage: goal.Weightage,
                                            Measure: goal.Measure,
                                            AttachmentPath: goal.AttachmentPath,
                                            TrainingItemId: goal.TrainingItemId,
                                            TrainingRequirementName: goal.TrainingRequirementName,
                                            TrainingCategory: goal.TrainingCategory
                                        };
                                    });
                                    self.renderCards();
                                    $('#goalsCardsContainer').show();
                                    $('#feedbackProgressContainer').show();
                                    self.updateProgressBar();
                                    $('#feedbackActionButtons').show();
                                    $('#stickyFooter').show();
                                    $('#btnSubmitFeedback').show(); // Always show submit button
                                    $('body').addClass('has-sticky-footer');
                                    
                                    // Ensure all cards are visible (not hidden)
                                    $('.goal-card').show();
                                    
                                    // Expand first card by default after a short delay to ensure DOM is ready
                                    setTimeout(function() {
                                        self.expandCard(0);
                                    }, 100);
                                    
                                    // Initialize collapse all button state
                                    $('#btnCollapseAll').prop('disabled', false);
                                    
                                    // Initialize collapse all button state
                                    $('#btnCollapseAll').prop('disabled', false);
                                }
                            }
                        });
                    },
                    error: function(xhr, statusText, errorThrown) {
                        $('#feedbackLoader').hide();
                        mfManagerFeedbackHidePageLoader();
                        console.error('Error loading goals:', errorThrown);
                        var errorMsg = '<div class="text-center" style="padding: 40px; color: #d9534f;">Error loading goals. Please try again.</div>';
                        $('#goalsCardsContainer').show().html(errorMsg);
                    }
                });
            }
        });
    },
    
    // Load submitted feedback in simple view
    loadSubmittedFeedback: function (feedbackData) {
        debugger;
        var self = this;
        var selectedyear = $('#ddlyearFeedback :selected').val();
        var empId = sessionStorage.EmployeeId;
        var appraisalCycleId = ddlAppCycle;
        var ToEmployeeId = GToEmployeeId;
        var svrPath = CONFIG.get('SERVERNAME');
        
        // Validate required variables
        if (!selectedyear || !appraisalCycleId || !ToEmployeeId) {
            console.error('Missing required parameters in loadSubmittedFeedback:', { selectedyear: selectedyear, appraisalCycleId: appraisalCycleId, ToEmployeeId: ToEmployeeId });
            $('#feedbackLoader').hide();
            $('#submittedFeedbackContainer').show().html('<div class="text-center" style="padding: 40px; color: #d9534f;">Error: Missing required parameters. Please refresh the page.</div>');
            return;
        }
        
        // Get goals with feedback data from EmployeeFeedBack table (using GetEmployeeKRA endpoint which uses GetSubmittedApprovedKRAForManagersFeedback stored procedure)
        // This will return goal data from EmployeeFeedBack first, fallback to EmployeeKRA
        var apiPath = svrPath + "EmployeeKRA/GetEmployeeKRA?AppraisalCycleId=" + appraisalCycleId + "&ToEmployeeId=" + ToEmployeeId + 
            "&StatusId=3&SelectedYear=" + selectedyear + "&SelfAssCycleId=" + selectedyear;
        
        $.ajax({
            url: apiPath,
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                'X-EmpNo': sessionStorage.EmployeeId
            },
            beforeSend: function() {
                $('#feedbackLoader').show();
            },
            success: function (goalsResponse) {
                debugger;
                // Hide loader
                $('#feedbackLoader').hide();
                mfManagerFeedbackHidePageLoader();
                
                var html = '<div class="submitted-feedback-view">';
                
                if (goalsResponse && goalsResponse.Success) {
                    var goals = goalsResponse.Result.data || [];
                    
                    if (goals.length === 0) {
                        html += '<div class="text-center" style="padding: 40px; color: #999;">No feedback found for this cycle.</div>';
                    } else {
                        // Create a map of feedback by KRAId for quick lookup
                        var feedbackMap = {};
                        if (feedbackData && feedbackData.Tables && feedbackData.Tables[0] && feedbackData.Tables[0].Rows) {
                            for (var i = 0; i < feedbackData.Tables[0].Rows.length; i++) {
                                var row = feedbackData.Tables[0].Rows[i];
                                if (row.QuestionaireId) {
                                    feedbackMap[row.QuestionaireId] = row.Feedback || '';
                                }
                            }
                        }
                        
                        // Show all goals at once (no cards, no navigation, just display all) - READ-ONLY, NO TEXTAREA
                        goals.forEach(function(goal, index) {
                            // Determine goal type class and text based on GoalType value
                            var goalTypeText = '';
                            var goalTypeClass = '';
                            
                            if (goal.GoalType === 'O' || goal.GoalType === 'Operational') {
                                goalTypeText = 'Operational';
                                goalTypeClass = 'operational';
                            } else if (goal.GoalType === 'S' || goal.GoalType === 'Strategic Goal (AI-Themed)' || (typeof goal.GoalType === 'string' && goal.GoalType.toUpperCase().includes('STRATEGIC'))) {
                                goalTypeText = 'Strategic Goal (AI-Themed)';
                                goalTypeClass = 'strategic';
                            } else {
                                goalTypeText = 'Developmental';
                                goalTypeClass = 'developmental';
                            }
                            debugger;
                            
                            html += '<div class="submitted-goal-item" style="background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
                            html += '<div style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #2196F3;">';
                            html += '<span class="goal-type-badge ' + goalTypeClass + '" style="display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; margin-right: 10px; background: ' + (goalTypeClass === 'operational' ? '#4CAF50' : (goalTypeClass === 'strategic' ? '#9C27B0' : '#FF9800')) + '; color: white;">' + goalTypeText + '</span>';
                            html += '<h4 style="margin: 0; flex: 1; color: #333;">' + (goal.GoalDescription || 'Goal Description Not Available') + '</h4>';
                            html += '<span style="font-weight: bold; color: #666; margin-left: 15px;">Weightage: ' + (goal.Weightage || 0) + '%</span>';
                            html += '</div>';
                            
                            html += '<div class="row" style="margin-bottom: 15px;">';
                            html += '<div class="col-md-6"><label style="font-weight: bold; color: #555;">Measures:</label><div style="padding: 10px; background: #f9f9f9; border-radius: 3px; min-height: 40px; white-space: pre-wrap;">' + (goal.Measure || 'Not specified') + '</div></div>';
                            html += '<div class="col-md-6"><label style="font-weight: bold; color: #555;">Self Assessment:</label><div style="padding: 10px; background: #f9f9f9; border-radius: 3px; min-height: 40px; white-space: pre-wrap;">' + (goal.Selfassesment || 'Not provided') + '</div></div>';
                            html += '</div>';
                            
                            // Get feedback text from feedbackMap - show as read-only DIV (NO TEXTAREA)
                            var feedbackText = feedbackMap[goal.KRAId] || '';
                            
                            html += '<div style="margin-bottom: 15px;"><label style="font-weight: bold; color: #555;">RM Feedback:</label><div style="padding: 10px; background: #f9f9f9; border-radius: 3px; min-height: 60px; white-space: pre-wrap;">' + (feedbackText || 'No feedback provided') + '</div></div>';
                            html += '</div>';
                        });
                    }
                } else {
                    html += '<div class="text-center" style="padding: 40px; color: #d9534f;">Error loading feedback data.</div>';
                }
                
                html += '</div>';
                
                // Hide progress bar and sticky footer for submitted feedback (since it's always 100%)
                $('#feedbackProgressContainer').hide();
                $('#stickyFooter').hide();
                $('body').removeClass('has-sticky-footer');
                
                // Ensure goals container is hidden and show submitted feedback
                $('#goalsCardsContainer').hide();
                $('#submittedFeedbackContainer').html(html).show();
            },
        error: function(xhr, statusText, errorThrown) {
            $('#feedbackLoader').hide();
            mfManagerFeedbackHidePageLoader();
            console.error('Error loading submitted feedback:', errorThrown);
            var errorMsg = 'Error loading feedback data.';
            if (xhr.responseJSON && xhr.responseJSON.ErrorMessage) {
                errorMsg = xhr.responseJSON.ErrorMessage;
            }
            var html = '<div class="submitted-feedback-view"><div class="text-center" style="padding: 40px; color: #d9534f;">' + errorMsg + '</div></div>';
            $('#goalsCardsContainer').hide();
            $('#submittedFeedbackContainer').html(html).show();
        }
    });
    },
    
    // Update progress bar based on feedback provided and weightage
    updateProgressBar: function() {
        var self = this;
        var totalWeightage = 0;
        var completedWeightage = 0;
        
        this.goals.forEach(function(goal) {
            var weightage = parseFloat(goal.Weightage) || 0;
            totalWeightage += weightage;
            
            var feedback = self.feedbacks[goal.KRAId] || {};
            if (!self.isRmFeedbackContentEmpty(feedback.Feedback)) {
                completedWeightage += weightage;
            }
        });
        
        var percentage = totalWeightage > 0 ? Math.round((completedWeightage / totalWeightage) * 100) : 0;
        
        $('#feedbackProgressBar').css('width', percentage + '%');
    },
    
    // Merge draft snapshot with goals. Training* for developmental goals comes only from EmployeeFeedback draft (manager-added), never from EmployeeKRA goal-setting.
    mergeDraftDataWithGoals: function () {
        var self = this;
        this.goals.forEach(function(goal) {
            var draft = self.drafts[goal.KRAId];
            var isDev = self.getGoalTypeForTrainingSection(goal) === 'D';

            if (isDev) {
                goal.TrainingItemId = '';
                goal.TrainingRequirementName = '';
                goal.TrainingCategory = '';
            }

            if (draft) {
                if (draft.GoalDescription) goal.GoalDescription = draft.GoalDescription;
                if (draft.GoalType) goal.GoalType = draft.GoalType;
                if (draft.Weightage !== null && draft.Weightage !== undefined) goal.Weightage = draft.Weightage;
                if (draft.Measure) goal.Measure = draft.Measure;
                if (draft.AttachmentPath) goal.AttachmentPath = draft.AttachmentPath;
                if (isDev) {
                    goal.TrainingItemId = draft.TrainingItemId != null ? String(draft.TrainingItemId) : '';
                    goal.TrainingRequirementName = draft.TrainingRequirementName != null ? String(draft.TrainingRequirementName) : '';
                    goal.TrainingCategory = draft.TrainingCategory != null ? String(draft.TrainingCategory) : '';
                }
                goal.DraftFeedback = draft.Feedback || '';
                goal.DraftFeedBackId = draft.FeedBackId;
            } else {
                goal.DraftFeedback = '';
                goal.DraftFeedBackId = 0;
            }
        });
    },
    
    getGoalTypeForTrainingSection: function(goal) {
        if (!goal) return '';
        if (goal.GoalType === 'O' || goal.GoalType === 'Operational') return 'O';
        if (goal.GoalType === 'S' || goal.GoalType === 'Strategic Goal (AI-Themed)' || (typeof goal.GoalType === 'string' && goal.GoalType.toUpperCase().includes('STRATEGIC'))) return 'S';
        return 'D';
    },
    
    parseTrainingFieldsToArray: function(trainingItemId, trainingRequirementName, trainingCategory) {
        var trainingIds = [];
        var trainingNames = [];
        var trainingCategories = [];
        var sep = '|||';
        function splitSafe(data) {
            if (data === null || data === undefined) return [];
            var d = typeof data === 'string' ? data : String(data);
            d = d.trim();
            if (d === '' || d === 'null') return [];
            if (d.indexOf(sep) >= 0) return d.split(sep).map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
            if (d.indexOf(',') >= 0) return d.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
            return [d];
        }
        if (trainingItemId !== null && trainingItemId !== undefined && String(trainingItemId) !== '' && String(trainingItemId) !== 'null') {
            trainingIds = splitSafe(trainingItemId);
        }
        if (trainingCategory !== null && trainingCategory !== undefined && String(trainingCategory) !== '' && String(trainingCategory) !== 'null') {
            trainingCategories = splitSafe(trainingCategory);
        }
        var expectedCount = Math.max(trainingIds.length, trainingCategories.length);
        if (trainingRequirementName !== null && trainingRequirementName !== undefined && String(trainingRequirementName) !== '' && String(trainingRequirementName) !== 'null') {
            var nameStr = String(trainingRequirementName).trim();
            if (nameStr.indexOf(sep) >= 0) {
                trainingNames = nameStr.split(sep).map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
            } else if (expectedCount > 1 && nameStr.indexOf(',') >= 0) {
                var parts = nameStr.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
                if (parts.length === expectedCount) {
                    trainingNames = parts;
                } else {
                    trainingNames = [nameStr];
                }
            } else {
                trainingNames = [nameStr];
            }
        }
        var trainingData = [];
        var maxLength = Math.max(trainingIds.length, trainingNames.length, trainingCategories.length);
        for (var i = 0; i < maxLength; i++) {
            var id = trainingIds[i] || '0';
            var name = trainingNames[i] || '';
            var category = trainingCategories[i] || '';
            if (name && name.trim() !== '') {
                trainingData.push({
                    trainingId: id,
                    trainingName: name,
                    trainingType: category || (id === '0' ? 'Other' : '')
                });
            }
        }
        return trainingData;
    },
    
    // Render goal cards
    renderCards: function() {
        var self = this; // Use ManagerFeedbackCards object
        var html = '';
        
        if (this.goals.length === 0) {
            html = '<div class="text-center" style="padding: 40px; color: #999;">No goals found for this cycle.</div>';
        } else {
            this.goals.forEach(function(goal, index) {
                html += self.renderCard(goal, index);
            });
        }
        
        $('#goalsCardsContainer').html(html);
        
        // Hide the old table if it exists
        $('#tblManagerFeedbackKRAList').closest('.bottom-padding').hide();
        $('#tblManagerFeedbackKRAList').hide();
        
        console.log('Cards rendered: ' + this.goals.length + ' goals');
    },
    
    // Render single card
    renderCard: function(goal, index) {
        var goalTypeClass = '';
        var goalTypeText = '';
        
        // Determine goal type class and text based on GoalType value
        if (goal.GoalType === 'O' || goal.GoalType === 'Operational') {
            goalTypeClass = 'operational';
            goalTypeText = 'Operational';
        } else if (goal.GoalType === 'S' || goal.GoalType === 'Strategic Goal (AI-Themed)' || (typeof goal.GoalType === 'string' && goal.GoalType.toUpperCase().includes('STRATEGIC'))) {
            goalTypeClass = 'strategic';
            goalTypeText = 'Strategic Goal (AI-Themed)';
        } else {
            goalTypeClass = 'developmental';
            goalTypeText = 'Developmental';
        }
       
        var employeeNameText = ($('#EmployeeName').text() || '').trim();
        // Header usually contains "Employee Name -12345"; remove trailing employee ID.
        employeeNameText = employeeNameText.replace(/\s*-\s*\d+\s*$/, '').trim();
        if (!employeeNameText) {
            employeeNameText = 'employee';
        }
        var employeeNameEscaped = employeeNameText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        // Truncate text for read more/less
        var kraHtml = goal.GoalDescription || 'Goal Description Not Available'; // Keep HTML for rendering
        var measureHtml = goal.Measure || 'Not specified'; // Keep HTML for rendering
        var kraText = $('<div>').html(kraHtml).text(); // Strip HTML for word count
        var measureText = $('<div>').html(measureHtml).text(); // Strip HTML for word count
        var selfAssessmentHtml = goal.Selfassesment || 'Not provided'; // Keep HTML for rendering
        var selfAssessmentText = $('<div>').html(selfAssessmentHtml).text(); // Strip HTML for word count
        var kraWords = kraText.split(/\s+/);
        var measureWords = measureText.split(/\s+/);
        var selfAssessmentWords = selfAssessmentText.split(/\s+/);
        var kraPreview = kraWords.length > 10 ? kraWords.slice(0, 10).join(' ') + '...' : kraText;
        var measurePreview = measureWords.length > 10 ? measureWords.slice(0, 10).join(' ') + '...' : measureText;
        var selfAssessmentPreview = selfAssessmentWords.length > 10 ? selfAssessmentWords.slice(0, 10).join(' ') + '...' : selfAssessmentText;
        
        var cardHtml = '<div class="goal-card" data-index="' + index + '" data-kraid="' + goal.KRAId + '">';
        
        // Header with Goal Type and Weightage (clickable to expand/collapse)
        cardHtml += '<div class="goal-card-header">';
        cardHtml += '<h3 style="margin: 0; font-size: 18px; font-weight: 600;">';
        cardHtml += '<span class="goal-type-badge ' + goalTypeClass + '">' + goalTypeText + '</span>';
        cardHtml += '<span class="goal-weightage"><strong>Weightage: ' + (goal.Weightage || 0) + '%</strong></span>';
        cardHtml += '<i class="glyphicon glyphicon-chevron-down expand-icon"></i>';
        cardHtml += '</h3>';
        cardHtml += '</div>';
        
        cardHtml += '<div class="goal-card-body">';
        
        // One row layout: Measures (col-md-4), Self Assessment (col-md-4), and Attachments (col-md-2)
        cardHtml += '<div class="row goal-details-row" style="margin-bottom: 20px;">';
        
        // Measures Column with KRA and Read More/Less - col-md-4
        cardHtml += '<div class="col-md-5">';
        cardHtml += '<label class="goal-field-label">Key Responsibility Area (KRA):</label>';
        cardHtml += '<div class="goal-field-value read-more-container" style="margin-bottom: 15px;">';
        if (kraWords.length > 10) {
            cardHtml += '<span class="read-more-preview">' + kraPreview + '</span>';
            cardHtml += '<span class="read-more-full" style="display: none;">' + kraHtml + '</span>';
            cardHtml += '<a href="javascript:void(0);" class="read-more-link" data-target="kra-' + index + '">Read More</a>';
        } else {
            cardHtml += '<span class="read-more-full">' + kraHtml + '</span>';
        }
        cardHtml += '</div>';
        cardHtml += '<label class="goal-field-label">Key Performance Indicators (KPIs):</label>';
        cardHtml += '<div class="goal-field-value read-more-container">';
        if (measureWords.length > 10) {
            cardHtml += '<span class="read-more-preview">' + measurePreview + '</span>';
            cardHtml += '<span class="read-more-full" style="display: none;">' + measureHtml + '</span>';
            cardHtml += '<a href="javascript:void(0);" class="read-more-link" data-target="measure-' + index + '">Read More</a>';
        } else {
            cardHtml += '<span class="read-more-full">' + measureHtml + '</span>';
        }
        cardHtml += '</div>';
        cardHtml += '</div>';
        
        // Self Assessment Column with Read More/Less - col-md-4
        cardHtml += '<div class="col-md-5">';
        cardHtml += '<label class="goal-field-label">Self Assessment:</label>';
        cardHtml += '<div class="goal-field-value read-more-container">';
        if (selfAssessmentWords.length > 10) {
            cardHtml += '<span class="read-more-preview">' + selfAssessmentPreview + '</span>';
            cardHtml += '<span class="read-more-full" style="display: none;">' + selfAssessmentHtml + '</span>';
            cardHtml += '<a href="javascript:void(0);" class="read-more-link" data-target="selfassess-' + index + '">Read More</a>';
        } else {
            cardHtml += '<span class="read-more-full">' + selfAssessmentHtml + '</span>';
        }
        cardHtml += '</div>'; // Close read-more-container
        cardHtml += '</div>'; // Close col-md-4
        
        // Attachments Column - col-md-2 (moved from inside Self Assessment)
        // Use ManagerFeedbackCards object directly to ensure we get the correct attachments
        var managerFeedbackCards = ManagerFeedbackCards;
        if (!managerFeedbackCards.selfAssessmentAttachments) {
            managerFeedbackCards.selfAssessmentAttachments = {};
        }
        
        // Convert KRAId to string for consistent key lookup (it might be a number)
        var kraIdKey = String(goal.KRAId);
        var attachments = managerFeedbackCards.selfAssessmentAttachments[kraIdKey] || [];
        
        // Debug logging
        console.log('ManagerFeedbackCards.renderCard: Checking attachments for KRAId', goal.KRAId, 'Key:', kraIdKey, 'Found:', attachments.length, 'Available keys:', Object.keys(managerFeedbackCards.selfAssessmentAttachments));
        if (attachments.length > 0) {
            console.log('ManagerFeedbackCards.renderCard: Attachments found for KRAId', goal.KRAId, ':', attachments);
        }
        
        cardHtml += '<div class="col-md-2">';
        cardHtml += '<label class="goal-field-label">Attachments:</label>';
        // Always show attachment section if there are attachments
        if (attachments.length > 0) {
            cardHtml += '<div class="self-assessment-attachments" style="margin-top: 5px;">';
            cardHtml += '<div style="display: flex; flex-direction: column; gap: 6px;">';
            attachments.forEach(function(attachment, attIndex) {
                var fileName = attachment.OriginalFileName || 'Attachment';
                var displayName = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
                var fileSize = attachment.FileSize ? ' (' + (attachment.FileSize / 1024).toFixed(1) + ' KB)' : '';
                cardHtml += '<a href="javascript:void(0);" class="btn btn-sm btn-primary download-self-assessment-attachment" data-attachment-id="' + attachment.AttachmentId + '" title="Click to download: ' + fileName + fileSize + '" style="font-size: 11px; padding: 5px 10px; border-radius: 4px; text-decoration: none; display: flex; align-items: center; gap: 5px; white-space: nowrap; cursor: pointer; width: 100%;">';
                cardHtml += '<i class="glyphicon glyphicon-download" style="font-size: 12px;"></i>';
                cardHtml += '<span style="flex: 1; overflow: hidden; text-overflow: ellipsis;">' + displayName + '</span>';
                cardHtml += '</a>';
            });
            cardHtml += '</div>';
            cardHtml += '</div>';
        } else {
            cardHtml += '<div class="self-assessment-attachments" style="margin-top: 5px; color: #999; font-size: 12px; font-style: italic;">No attachments</div>';
        }
        cardHtml += '</div>'; // Close col-md-2
        
        cardHtml += '</div>'; // row
        
        // RM Feedback
        cardHtml += '<div class="goal-field" style="margin-bottom: 20px;">';
        cardHtml += '<label>RM Feedback: <span style="color: red;">*</span></label>';
        cardHtml += '<textarea class="rm-feedback-textarea maxlength="4000"  form-control" data-kraid="' + goal.KRAId + '" rows="4" placeholder="Enter your feedback here...">' + (goal.DraftFeedback || '') + '</textarea>';
        cardHtml += '</div>';
        
        // Training Requirement Section (only for Developmental goals)
        var goalTypeForTraining = '';
        if (goal.GoalType === 'O' || goal.GoalType === 'Operational') {
            goalTypeForTraining = 'O';
        } else if (goal.GoalType === 'S' || goal.GoalType === 'Strategic Goal (AI-Themed)' || (typeof goal.GoalType === 'string' && goal.GoalType.toUpperCase().includes('STRATEGIC'))) {
            goalTypeForTraining = 'S';
        } else {
            goalTypeForTraining = 'D';
        }
        
        if (goalTypeForTraining === 'D') {
            cardHtml += '<div class="goal-field training-requirement-section" data-kraid="' + goal.KRAId + '" style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">';
            cardHtml += '<div style="margin-bottom: 8px; color: #555;">Recommend training areas that support both current role and aligns with future aspirations.</div>';
            cardHtml += '<label style="font-weight: 600; margin-bottom: 10px; display: block;">Training recommendations:</label>';
            
            // Training Requirement Dropdown and Controls - same as goal addition
            cardHtml += '<div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">';
            cardHtml += '<select id="ddlTrainingRequirement_' + goal.KRAId + '" class="form-control training-requirement-dropdown" data-kraid="' + goal.KRAId + '" style="display: none;">';
            cardHtml += '<option value="">-- Select Training/Certification --</option>';
            cardHtml += '</select>';
            cardHtml += '<input type="text" id="txtTrainingRequirementOther_' + goal.KRAId + '" class="form-control training-requirement-other" data-kraid="' + goal.KRAId + '" placeholder="Enter training/certification name" style="display: none; width: 300px;" maxlength="500" />';
            cardHtml += '<button type="button" class="btn btn-primary btn-sm btn-add-training-other" data-kraid="' + goal.KRAId + '" id="btnAddTrainingOther_' + goal.KRAId + '" style="display: none;">';
            cardHtml += '<i class="glyphicon glyphicon-plus"></i> Add';
            cardHtml += '</button>';
            cardHtml += '<button type="button" class="btn btn-default btn-sm btn-cancel-training-other" data-kraid="' + goal.KRAId + '" id="btnCancelTrainingOther_' + goal.KRAId + '" style="display: none;">';
            cardHtml += '<i class="glyphicon glyphicon-remove"></i> Cancel';
            cardHtml += '</button>';
            cardHtml += '</div>';
            
            // Selected Training List Container
            cardHtml += '<div id="selectedTrainingListContainer_' + goal.KRAId + '" class="selected-training-list-container" style="margin-top: 10px; display: none;">';
            cardHtml += '<table id="selectedTrainingList_' + goal.KRAId + '" class="table table-bordered table-striped table-hover" style="margin-bottom: 0; width: 100%;">';
            cardHtml += '<thead>';
            cardHtml += '<tr>';
            cardHtml += '<th style="width: 40%; text-align: center;">Training Name</th>';
            cardHtml += '<th style="width: 40%; text-align: center;">Training Type</th>';
            cardHtml += '<th style="width: 20%; text-align: center;">Action</th>';
            cardHtml += '</tr>';
            cardHtml += '</thead>';
            cardHtml += '<tbody></tbody>';
            cardHtml += '</table>';
            cardHtml += '</div>';
            
            // Hidden fields to store training data
            cardHtml += '<input type="hidden" id="hdnTrainingItemId_' + goal.KRAId + '" class="hdn-training-item-id" data-kraid="' + goal.KRAId + '" value="' + (goal.TrainingItemId || '') + '" />';
            cardHtml += '<input type="hidden" id="hdnTrainingRequirementName_' + goal.KRAId + '" class="hdn-training-requirement-name" data-kraid="' + goal.KRAId + '" value="' + (goal.TrainingRequirementName || '') + '" />';
            cardHtml += '<input type="hidden" id="hdnTrainingCategory_' + goal.KRAId + '" class="hdn-training-category" data-kraid="' + goal.KRAId + '" value="' + (goal.TrainingCategory || '') + '" />';
            
            cardHtml += '</div>'; // Close training-requirement-section
        }
        
        // Navigation buttons
        cardHtml += '<div class="goal-navigation" style="text-align: right; padding-top: 15px; border-top: 1px solid #ddd; margin-top: 20px;">';
        if (index > 0) {
            cardHtml += '<button type="button" class="btn btn-default btn-previous-goal" data-index="' + (index - 1) + '"><i class="glyphicon glyphicon-chevron-left"></i> Previous Goal</button>';
        }
        if (index < this.goals.length - 1) {
            cardHtml += '<button type="button" class="btn btn-primary btn-next-goal" data-index="' + (index + 1) + '" style="margin-left: 10px;">Next Goal <i class="glyphicon glyphicon-chevron-right"></i></button>';
        }
        cardHtml += '</div>';
        
        cardHtml += '</div>'; // goal-card-body
        cardHtml += '</div>'; // goal-card
        
        return cardHtml;
    },
    
    // Toggle card expand/collapse
    toggleCard: function(index) {
        var $card = $('.goal-card[data-index="' + index + '"]');
        
        if (this.isExpandAllMode) {
            // In expand all mode, just toggle this card
            if ($card.hasClass('expanded')) {
                this.collapseCard(index);
            } else {
                this.expandCard(index);
            }
        } else {
            // Normal mode: one at a time
            if ($card.hasClass('expanded')) {
                // If clicking on expanded card, collapse it
                this.collapseCard(index);
            } else {
                // Collapse all others first
                $('.goal-card.expanded').each(function() {
                    var idx = parseInt($(this).data('index'));
                    ManagerFeedbackCards.collapseCard(idx);
                });
                // Then expand this one
                this.expandCard(index);
            }
        }
    },
    
    // Expand a specific card
    expandCard: function(index) {
        var $card = $('.goal-card[data-index="' + index + '"]');
        if (!$card.hasClass('expanded')) {
            $card.addClass('expanded');
            if (this.expandedCards.indexOf(index) === -1) {
                this.expandedCards.push(index);
            }
            this.currentCardIndex = index;
            
            // Initialize Summernote editor for RM Feedback textarea
            this.initializeRMFeedbackEditor(index);
            
            // Bind autosave for all textareas (only needs to be done once)
            if (!this.autosaveBound) {
                this.bindAutosave();
                this.autosaveBound = true;
            }
            
            // Bind read more/less
            this.bindReadMore();
            
            // Initialize Training Requirement for this card (if Developmental goal)
            this.initializeTrainingRequirementForCard(index);
            
            // Update progress bar
            this.updateProgressBar();
            
            // Focus on textarea and scroll to card
            setTimeout(function() {
                var cardTop = $card.offset().top;
                var cardHeight = $card.outerHeight(true);
                var windowTop = $(window).scrollTop();
                var windowHeight = $(window).height();
                var headerOffset = 100; // Space for header/navigation
                
                // Check if card is not fully visible
                var cardBottom = cardTop + cardHeight;
                var visibleTop = windowTop + headerOffset;
                var visibleBottom = windowTop + windowHeight;
                
                if (cardTop < visibleTop || cardBottom > visibleBottom) {
                    // Scroll to show the complete card
                    var targetScrollTop = cardTop - headerOffset;
                    $('html, body').animate({
                        scrollTop: targetScrollTop
                    }, 400, function() {
                        // Focus on textarea after scroll completes
                        var $textarea = $card.find('.rm-feedback-textarea');
                        if ($textarea.length) {
                            $textarea.focus();
                        }
                    });
                } else {
                    // Card is already visible, just focus
                    var $textarea = $card.find('.rm-feedback-textarea');
                    if ($textarea.length) {
                        $textarea.focus();
                    }
                }
            }, 100);
        } else {
            // If already expanded, just focus on textarea
            setTimeout(function() {
                var $textarea = $card.find('.rm-feedback-textarea');
                if ($textarea.length) {
                    $textarea.focus();
                }
            }, 50);
        }
    },
    
    // Initialize Summernote editor for RM Feedback textarea
    initializeRMFeedbackEditor: function(index) {
        var self = this;
        var goal = this.goals[index];
        if (!goal) return;
        
        var kraId = goal.KRAId;
        var $textarea = $('.goal-card[data-index="' + index + '"] .rm-feedback-textarea[data-kraid="' + kraId + '"]');
        
        if ($textarea.length === 0) return;
        
        // Check if Summernote is available
        if (typeof $.fn.summernote === 'undefined') {
            console.warn('Summernote library not loaded. Using plain textarea.');
            return;
        }
        
        // Check if already initialized
        if ($textarea.data('summernote')) {
            return;
        }
        
        // Get existing content
        var existingContent = goal.DraftFeedback || '';
        
        // Initialize Summernote with same config as Self Assessment
        setTimeout(function() {
            try {
                $textarea.summernote({
                height: 150,
                placeholder: 'Enter your feedback here...',
                fontNames: ['Arial', 'Arial Black', 'Courier New', 'Helvetica', 'Times New Roman', 'Verdana'],
                icons: {
                    'align': 'glyphicon glyphicon-align-left',
                    'alignCenter': 'glyphicon glyphicon-align-center',
                    'alignJustify': 'glyphicon glyphicon-align-justify',
                    'alignLeft': 'glyphicon glyphicon-align-left',
                    'alignRight': 'glyphicon glyphicon-align-right',
                    'indent': 'glyphicon glyphicon-indent-left',
                    'outdent': 'glyphicon glyphicon-indent-right',
                    'arrowsAlt': 'glyphicon glyphicon-fullscreen',
                    'bold': 'glyphicon glyphicon-bold',
                    'caret': 'glyphicon glyphicon-caret-down',
                    'circle': 'glyphicon glyphicon-record',
                    'close': 'glyphicon glyphicon-remove',
                    'code': 'glyphicon glyphicon-console',
                    'font': 'glyphicon glyphicon-font',
                    'frame': 'glyphicon glyphicon-stop',
                    'italic': 'glyphicon glyphicon-italic',
                    'link': 'glyphicon glyphicon-link',
                    'unlink': 'glyphicon glyphicon-scissors',
                    'magic': 'glyphicon glyphicon-tint',
                    'menuCheck': 'glyphicon glyphicon-check',
                    'minus': 'glyphicon glyphicon-minus',
                    'orderedlist': 'fa fa-list-ol',
                    'pencil': 'glyphicon glyphicon-pencil',
                    'picture': 'glyphicon glyphicon-picture',
                    'question': 'glyphicon glyphicon-question-sign',
                    'redo': 'fa fa-repeat',
                    'square': 'glyphicon glyphicon-unchecked',
                    'strikethrough': 'fa fa-strikethrough',
                    'subscript': 'glyphicon glyphicon-subscript',
                    'superscript': 'glyphicon glyphicon-superscript',
                    'table': 'glyphicon glyphicon-th',
                    'textHeight': 'glyphicon glyphicon-text-height',
                    'trash': 'glyphicon glyphicon-trash',
                    'underline': 'fa fa-underline',
                    'undo': 'fa fa-undo',
                    'unorderedlist': 'glyphicon glyphicon-list',
                    'video': 'glyphicon glyphicon-facetime-video'
                },
                toolbar: [
                    ['style', ['bold', 'italic', 'underline', 'strikethrough']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['view', ['undo', 'redo']]
                ],
                disableDragAndDrop: true,
                callbacks: {
                    onInit: function() {
                        // Reset toolbar button states after initialization
                        setTimeout(function() {
                            $('.note-editor .note-btn').removeClass('active');
                        }, 50);
                    },
                    onPaste: function (e) {
                        if (typeof window.pepSummernoteOnPastePlainTextOnly === 'function') {
                            window.pepSummernoteOnPastePlainTextOnly(e);
                        }
                    }
                }
            });
            } catch (error) {
                console.error('Error initializing Summernote for RM Feedback:', error);
            }
        }, 100);
    },
    
    // Collapse a specific card
    collapseCard: function(index) {
        var $card = $('.goal-card[data-index="' + index + '"]');
        if ($card.hasClass('expanded')) {
            $card.removeClass('expanded');
            this.expandedCards = this.expandedCards.filter(function(i) { return i !== index; });
            // If this was the current card and we're not in expand all mode, clear current
            if (!this.isExpandAllMode && this.currentCardIndex === index) {
                this.currentCardIndex = -1;
            }
        }
    },
    
    // Expand all cards
    expandAll: function() {
        var self = this;
        this.isExpandAllMode = true;
        this.goals.forEach(function(goal, index) {
            self.expandCard(index);
        });
        $('#btnExpandAll').prop('disabled', true);
        $('#btnCollapseAll').prop('disabled', false);
        toastr.info('All goals expanded. You can now expand/collapse any goal individually.');
    },
    
    // Collapse all cards
    collapseAll: function() {
        var self = this;
        this.isExpandAllMode = false;
        this.goals.forEach(function(goal, index) {
            self.collapseCard(index);
        });
        this.expandedCards = [];
        $('#btnExpandAll').prop('disabled', false);
        $('#btnCollapseAll').prop('disabled', true);
        // Expand first card after collapsing all
        if (self.goals.length > 0) {
            setTimeout(function() {
                self.expandCard(0);
            }, 100);
        }
    },
    
    // Navigate to next goal
    navigateToNextGoal: function(currentIndex) {
        var self = this;
        var card = $('.goal-card[data-index="' + currentIndex + '"]');
        var $textarea = card.find('.rm-feedback-textarea');
        var kraId = this.goals[currentIndex].KRAId;
        var feedback = this.getFeedbackFromTextarea($textarea);

        // Check if feedback is empty or just contains empty tags
        var plainText = $('<div>').html(feedback).text().trim();
        if (!plainText) {
            // Show a warning to the user
            toastr.error('RM Feedback cannot be empty.');
            return; // Stop execution
        }

        // Save draft before navigating
        this.saveDraftWithGoalData(kraId, feedback, this.goals[currentIndex], function() {
            // After saving, navigate to the next goal
            var nextIndex = currentIndex + 1;
            if (nextIndex < self.goals.length) {
                self.collapseCard(currentIndex);
                self.expandCard(nextIndex);
            } else {
                showAjaxAlert('Info', 'This is the last goal.', 'info');
            }
        });
    },
    
    // Navigate to previous goal
    navigateToPreviousGoal: function(currentIndex) {
        var self = this;
        
        // Save current feedback before navigating
        var $currentTextarea = $('.goal-card[data-index="' + currentIndex + '"]').find('.rm-feedback-textarea');
        if ($currentTextarea.length) {
            var currentFeedback = self.getFeedbackFromTextarea($currentTextarea);
            var currentGoal = this.goals[currentIndex];
            if (currentGoal && !self.isRmFeedbackContentEmpty(currentFeedback)) {
                // Save immediately before navigating
                this.saveDraftWithGoalData(currentGoal.KRAId, currentFeedback, currentGoal);
            }
        }
        
        // Get previous index
        var prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            // Collapse current card
            this.collapseCard(currentIndex);
            
            // Expand previous card
            setTimeout(function() {
                self.expandCard(prevIndex);
                
                // Scroll to make the previous card completely visible
                var $prevCard = $('.goal-card[data-index="' + prevIndex + '"]');
                if ($prevCard.length) {
                    var cardOffset = $prevCard.offset().top;
                    var cardHeight = $prevCard.outerHeight(true);
                    var windowHeight = $(window).height();
                    var scrollTop = $(window).scrollTop();
                    var headerOffset = 100; // Space for header/navigation
                    
                    // Calculate the scroll position to show the entire card
                    var targetScrollTop = cardOffset - headerOffset;
                    
                    // Smooth scroll to show the complete card
                    $('html, body').animate({
                        scrollTop: targetScrollTop
                    }, 400, function() {
                        // Focus on textarea after scroll completes
                        var $textarea = $prevCard.find('.rm-feedback-textarea');
                        if ($textarea.length) {
                            $textarea.focus();
                        }
                    });
                }
            }, 150);
        }
    },
    
    // Save all drafts manually
    saveAllDrafts: function() {
        var self = this;
        var savedCount = 0;
        var totalCount = this.goals.length;
        
        // Sync all textarea values into feedbacks before saving
        $('.rm-feedback-textarea').each(function() {
            var $textarea = $(this);
            var kraId = parseInt($textarea.data('kraid'));
            var feedback = self.getFeedbackFromTextarea($textarea);
            
            var goal = self.goals.find(function(g) { return g.KRAId === kraId; });
            
            if (goal) {
                self.feedbacks[kraId] = {
                    Feedback: feedback,
                    GoalType: goal.GoalType,
                    GoalDescription: goal.GoalDescription,
                    Weightage: goal.Weightage,
                    Measure: goal.Measure,
                    AttachmentPath: goal.AttachmentPath,
                    TrainingItemId: goal.TrainingItemId,
                    TrainingRequirementName: goal.TrainingRequirementName,
                    TrainingCategory: goal.TrainingCategory
                };
            }
        });
        
        // Show saving indicator
        var $saveBtn = $('#btnSaveDraft');
        var originalText = $saveBtn.html();
        $saveBtn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Saving...');
        
        // Save all feedbacks that have content
        var savePromises = [];
        this.goals.forEach(function(goal) {
            var feedback = self.feedbacks[goal.KRAId] || {};
            var feedbackText = feedback.Feedback || '';
            
            if (!self.isRmFeedbackContentEmpty(feedbackText)) {
                var promise = new Promise(function(resolve) {
                    self.saveDraftWithGoalData(goal.KRAId, feedbackText, goal, function() {
                        savedCount++;
                        resolve();
                    });
                });
                savePromises.push(promise);
            }
        });
        
        // Wait for all saves to complete
        Promise.all(savePromises).then(function() {
            $saveBtn.prop('disabled', false).html(originalText);
            if (savedCount > 0) {
                // Clear any existing toastr messages first
                toastr.clear();
                toastr.success('Draft saved for ' + savedCount + ' goal(s).');
                self.showAutosaveIndicator();
            } else {
                toastr.info('No feedback to save.');
            }
        }).catch(function(error) {
            console.error('Error saving drafts:', error);
            $saveBtn.prop('disabled', false).html(originalText);
            toastr.error('Error saving drafts. Please try again.');
        });
    },
    
    // Bind autosave on textarea change
    bindAutosave: function() {
        var self = this;
        
        // Remove existing handlers to prevent duplicates
        $(document).off('input blur change summernote.change summernote.blur', '.rm-feedback-textarea');
        $(window).off('beforeunload', self.savePendingFeedbacks);
        
        // Bind input event for typing (with 2 second debounce)
        $(document).on('input summernote.change', '.rm-feedback-textarea', function() {
            var $textarea = $(this);
            var kraId = parseInt($textarea.data('kraid'));
            var feedback = self.getFeedbackFromTextarea($textarea);
            var feedbackStored = self.isRmFeedbackContentEmpty(feedback) ? '' : feedback;
            
            var goal = self.goals.find(function(g) { return g.KRAId === kraId; });
            
            if (goal) {
                // Get Training Requirement from hidden fields (in case manager updated them)
                var trainingItemId = $('#hdnTrainingItemId_' + kraId).val() || goal.TrainingItemId || '';
                var trainingRequirementName = $('#hdnTrainingRequirementName_' + kraId).val() || goal.TrainingRequirementName || '';
                var trainingCategory = $('#hdnTrainingCategory_' + kraId).val() || goal.TrainingCategory || '';
                
                // Update goal object
                goal.TrainingItemId = trainingItemId;
                goal.TrainingRequirementName = trainingRequirementName;
                goal.TrainingCategory = trainingCategory;
                
                // Update feedbacks object immediately
                self.feedbacks[kraId] = {
                    Feedback: feedbackStored,
                    GoalType: goal.GoalType,
                    GoalDescription: goal.GoalDescription,
                    Weightage: goal.Weightage,
                    Measure: goal.Measure,
                    AttachmentPath: goal.AttachmentPath,
                    TrainingItemId: trainingItemId,
                    TrainingRequirementName: trainingRequirementName,
                    TrainingCategory: trainingCategory
                };
                
                // Update progress bar
                self.updateProgressBar();
                
                // Clear existing timer for this textarea
                if (self.autosaveTimers[kraId]) {
                    clearTimeout(self.autosaveTimers[kraId]);
                }
                
                // Set new timer for autosave (2 seconds after typing stops - faster than before)
                self.autosaveTimers[kraId] = setTimeout(function() {
                    var currentFeedback = '';
                    
                    // Check if Summernote is initialized
                    if ($textarea.data('summernote') && typeof $.fn.summernote !== 'undefined') {
                        try {
                            currentFeedback = $textarea.summernote('code');
                        } catch (e) {
                            currentFeedback = $textarea.val();
                        }
                    } else {
                        currentFeedback = $textarea.val();
                    }
                    
                    // Get latest Training Requirement data before saving (always sync draft; empty editor → Feedback '' in DB)
                    var trainingItemId = $('#hdnTrainingItemId_' + kraId).val() || goal.TrainingItemId || '';
                    var trainingRequirementName = $('#hdnTrainingRequirementName_' + kraId).val() || goal.TrainingRequirementName || '';
                    var trainingCategory = $('#hdnTrainingCategory_' + kraId).val() || goal.TrainingCategory || '';
                    goal.TrainingItemId = trainingItemId;
                    goal.TrainingRequirementName = trainingRequirementName;
                    goal.TrainingCategory = trainingCategory;
                    
                    self.saveDraftWithGoalData(kraId, currentFeedback, goal, function() {
                        self.showAutosaveIndicator();
                    });
                }, 2000); // Changed from 5000ms to 2000ms (2 seconds)
            }
        });
        
        // Bind blur event for immediate save when leaving field
        $(document).on('blur summernote.blur', '.rm-feedback-textarea', function() {
            var $textarea = $(this);
            var kraId = parseInt($textarea.data('kraid'));
            var feedback = self.getFeedbackFromTextarea($textarea);
            
            var goal = self.goals.find(function(g) { return g.KRAId === kraId; });
            
            if (goal) {
                // Clear timer since we're saving immediately
                if (self.autosaveTimers[kraId]) {
                    clearTimeout(self.autosaveTimers[kraId]);
                    delete self.autosaveTimers[kraId];
                }
                
                // Get latest Training Requirement data before saving
                var trainingItemId = $('#hdnTrainingItemId_' + kraId).val() || goal.TrainingItemId || '';
                var trainingRequirementName = $('#hdnTrainingRequirementName_' + kraId).val() || goal.TrainingRequirementName || '';
                var trainingCategory = $('#hdnTrainingCategory_' + kraId).val() || goal.TrainingCategory || '';
                goal.TrainingItemId = trainingItemId;
                goal.TrainingRequirementName = trainingRequirementName;
                goal.TrainingCategory = trainingCategory;
                
                // Save on blur (empty Summernote → normalized to '' in saveDraftWithGoalData)
                self.saveDraftWithGoalData(kraId, feedback, goal, function() {
                    self.showAutosaveIndicator();
                });
            }
        });
        
        // Bind beforeunload event to save all pending feedbacks when user closes tab/browser
        $(window).on('beforeunload', function(e) {
            self.savePendingFeedbacks();
        });
    },
    
    // Save all pending feedbacks (for beforeunload)
    savePendingFeedbacks: function() {
        var self = ManagerFeedbackCards;
        
        // Sync all textarea values and training requirement data into feedbacks before saving
        $('.rm-feedback-textarea').each(function() {
            var $textarea = $(this);
            var kraId = parseInt($textarea.data('kraid'));
            var feedback = self.getFeedbackFromTextarea($textarea);
            var goal = self.goals.find(function(g) { return g.KRAId === kraId; });
            
            if (goal) {
                // Get Training Requirement from hidden fields (in case manager updated them)
                var trainingItemId = $('#hdnTrainingItemId_' + kraId).val() || goal.TrainingItemId || '';
                var trainingRequirementName = $('#hdnTrainingRequirementName_' + kraId).val() || goal.TrainingRequirementName || '';
                var trainingCategory = $('#hdnTrainingCategory_' + kraId).val() || goal.TrainingCategory || '';
                
                // Update goal object
                goal.TrainingItemId = trainingItemId;
                goal.TrainingRequirementName = trainingRequirementName;
                goal.TrainingCategory = trainingCategory;
                
                self.feedbacks[kraId] = {
                    Feedback: feedback,
                    GoalType: goal.GoalType,
                    GoalDescription: goal.GoalDescription,
                    Weightage: goal.Weightage,
                    Measure: goal.Measure,
                    AttachmentPath: goal.AttachmentPath,
                    TrainingItemId: trainingItemId,
                    TrainingRequirementName: trainingRequirementName,
                    TrainingCategory: trainingCategory
                };
            }
        });
        
        // Save all feedbacks that have content (synchronously to ensure they complete)
        var savePromises = [];
        self.goals.forEach(function(goal) {
            var feedback = self.feedbacks[goal.KRAId] || {};
            var feedbackText = feedback.Feedback || '';
            
            if (!self.isRmFeedbackContentEmpty(feedbackText)) {
                // Use synchronous AJAX for beforeunload to ensure save completes
                var selectedyear = $('#ddlyearFeedback :selected').val();
                var empId = sessionStorage.EmployeeId;
                var appraisalCycleId = ddlAppCycle;
                var ToEmployeeId = GToEmployeeId;
                
                // Get Training Requirement from hidden fields or goal object
                var trainingItemId = $('#hdnTrainingItemId_' + goal.KRAId).val() || goal.TrainingItemId || '';
                var trainingRequirementName = $('#hdnTrainingRequirementName_' + goal.KRAId).val() || goal.TrainingRequirementName || '';
                var trainingCategory = $('#hdnTrainingCategory_' + goal.KRAId).val() || goal.TrainingCategory || '';
                
                var requestData = {
                    ToEmployeeId: ToEmployeeId,
                    FromEmployeeId: parseInt(empId),
                    AppraisalCycleId: appraisalCycleId,
                    QuestionaireId: goal.KRAId,
                    Feedback: feedbackText,
                    PerformCycleCheck: selectedyear,
                    TrainingItemId: trainingItemId,
                    TrainingRequirementName: trainingRequirementName,
                    TrainingCategory: trainingCategory
                };
                
                var apiPath = self.getApiPath('/ManagerFeedback/SaveDraft');
                
                // Synchronous save to ensure it completes before page unloads
                $.ajax({
                    url: apiPath,
                    type: 'POST',
                    data: JSON.stringify(requestData),
                    async: false, // Synchronous for beforeunload
                    dataType: 'json',
                    contentType: 'application/json',
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                        'X-EmpNo': sessionStorage.EmployeeId
                    },
                    success: function(response) {
                        // Silently save - no indicator needed on page unload
                    },
                    error: function(xhr, statusText, errorThrown) {
                        console.error('Error saving draft on page unload:', errorThrown);
                    }
                });
            }
        });
    },
    
    
    // Save draft with complete goal data
    saveDraftWithGoalData: function(kraId, feedback, goal, callback) {
        var self = this;
        var selectedyear = $('#ddlyearFeedback :selected').val();
        var empId = sessionStorage.EmployeeId;
        var appraisalCycleId = ddlAppCycle;
        var ToEmployeeId = GToEmployeeId;
        
        // Never persist Summernote empty markup (<p><br></p>) — save as empty string so DB stays clean
        var feedbackToSave = (feedback != null && !self.isRmFeedbackContentEmpty(feedback)) ? feedback : '';
        
        // Get Training Requirement data from hidden fields (in case it was updated)
        var trainingItemId = $('#hdnTrainingItemId_' + kraId).val() || goal.TrainingItemId || '';
        var trainingRequirementName = $('#hdnTrainingRequirementName_' + kraId).val() || goal.TrainingRequirementName || '';
        var trainingCategory = $('#hdnTrainingCategory_' + kraId).val() || goal.TrainingCategory || '';
        
        // Update goal object with latest training data
        goal.TrainingItemId = trainingItemId;
        goal.TrainingRequirementName = trainingRequirementName;
        goal.TrainingCategory = trainingCategory;
        
        // Update feedbacks object
        self.feedbacks[kraId] = {
            Feedback: feedbackToSave,
            GoalType: goal.GoalType,
            GoalDescription: goal.GoalDescription,
            Weightage: goal.Weightage,
            Measure: goal.Measure,
            AttachmentPath: goal.AttachmentPath,
            TrainingItemId: trainingItemId,
            TrainingRequirementName: trainingRequirementName,
            TrainingCategory: trainingCategory
        };
        
        var requestData = {
            ToEmployeeId: ToEmployeeId,
            FromEmployeeId: parseInt(empId),
            AppraisalCycleId: appraisalCycleId,
            QuestionaireId: kraId,
            Feedback: feedbackToSave,
            PerformCycleCheck: selectedyear,
            TrainingItemId: trainingItemId,
            TrainingRequirementName: trainingRequirementName,
            TrainingCategory: trainingCategory
        };
        
        var apiPath = self.getApiPath('/ManagerFeedback/SaveDraft');
        
        // Save asynchronously
        $.ajax({
            url: apiPath,
            type: 'POST',
            data: JSON.stringify(requestData),
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                'X-EmpNo': sessionStorage.EmployeeId
            },
            success: function(response) {
                if (response && response.Success) {
                    if (callback) callback();
                }
            },
            error: function(xhr, statusText, errorThrown) {
                console.error('Error saving draft:', errorThrown);
                if (callback) callback();
            }
        });
    },
    
    // Initialize Training Requirement for a specific card
    initializeTrainingRequirementForCard: function(index) {
        var self = this;
        var goal = this.goals[index];
        if (!goal) return;
        
        var kraId = goal.KRAId;
        var goalType = '';
        if (goal.GoalType === 'O' || goal.GoalType === 'Operational') {
            goalType = 'O';
        } else if (goal.GoalType === 'S' || goal.GoalType === 'Strategic Goal (AI-Themed)' || (typeof goal.GoalType === 'string' && goal.GoalType.toUpperCase().includes('STRATEGIC'))) {
            goalType = 'S';
        } else {
            goalType = 'D';
        }
        
        // Only initialize for Developmental goals
        if (goalType !== 'D') return;
        
        var $section = $('.training-requirement-section[data-kraid="' + kraId + '"]');
        if ($section.length === 0) return;
        
        var rows = this.parseTrainingFieldsToArray(
            goal.TrainingItemId, goal.TrainingRequirementName, goal.TrainingCategory);
        
        this.loadTrainingRequirementsForCard(kraId);
        
        this.initializeTrainingListDataTable(kraId, rows);
        
        // Bind event handlers for this card's training requirement
        this.bindTrainingRequirementEvents(kraId);
    },
    
    // Load training requirements dropdown for a specific card
    loadTrainingRequirementsForCard: function(kraId) {
        var self = this;
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + "Trainings/GetIPETrainingList";
        
        var $dropdown = $('#ddlTrainingRequirement_' + kraId);
        if ($dropdown.length === 0) return;
        
        $.ajax({
            url: apiPath,
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                'X-EmpNo': sessionStorage.EmployeeId
            },
            success: function(response) {
                $dropdown.empty();
                $dropdown.append($('<option></option>').val('').text('-- Select Training/Certification --'));
                
                // Add static options
                $dropdown.append($('<option></option>').val('0').text('Soft Skill'));
                $dropdown.append($('<option></option>').val('0').text('Compliance'));
                $dropdown.append($('<option></option>').val('0').text('Process'));
                $dropdown.append($('<option></option>').val('0').text('Domain'));
                $dropdown.append($('<option></option>').val('0').text('Other'));
                
                if (response && response.Result && Array.isArray(response.Result)) {
                    $.each(response.Result, function(index, item) {
                        var trainingName = item.TrainingName || item.TrainingTitle;
                        var trainingType = item.TrainingType || '';
                        if (item && trainingName) {
                            var $option = $('<option></option>')
                                .val(item.TrainingId)
                                .text(trainingName)
                                .data('training-type', trainingType);
                            $dropdown.append($option);
                        }
                    });
                }
                
                // Initialize Select2
                if (typeof $.fn.select2 !== 'undefined') {
                    if ($dropdown.hasClass('select2-hidden-accessible')) {
                        $dropdown.select2('destroy');
                    }
                    $dropdown.select2({
                        placeholder: '-- Select Training/Certification --',
                        allowClear: true,
                        width: '300px'
                    });
                }
                
                $dropdown.show();
            },
            error: function(xhr, status, error) {
                console.error('Error loading training requirements:', error);
                // Show dropdown with static options only
                $dropdown.empty();
                $dropdown.append($('<option></option>').val('').text('-- Select Training/Certification --'));
                $dropdown.append($('<option></option>').val('0').text('Soft Skill'));
                $dropdown.append($('<option></option>').val('0').text('Compliance'));
                $dropdown.append($('<option></option>').val('0').text('Process'));
                $dropdown.append($('<option></option>').val('0').text('Domain'));
                $dropdown.append($('<option></option>').val('0').text('Other'));
                $dropdown.show();
            }
        });
    },
    
    // Load existing training data into the list (parses same format as EmployeeKRA / draft fields)
    loadExistingTrainingData: function(kraId, trainingItemId, trainingRequirementName, trainingCategory) {
        var trainingData = this.parseTrainingFieldsToArray(trainingItemId, trainingRequirementName, trainingCategory);
        this.initializeTrainingListDataTable(kraId, trainingData);
    },
    
    // Initialize DataTable for training list
    initializeTrainingListDataTable: function(kraId, trainingData) {
        var self = this;
        var $container = $('#selectedTrainingListContainer_' + kraId);
        var $table = $('#selectedTrainingList_' + kraId);
        
        if ($table.length === 0 || $container.length === 0) return;
        
        // Destroy existing DataTable if it exists
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().destroy();
        }
        
        // Clear table body
        $table.find('tbody').empty();
        
        if (trainingData && trainingData.length > 0) {
            // Populate table - same layout as goal addition (Training Name, Training Type, red X Action)
            trainingData.forEach(function(item) {
                var displayType = (item.trainingType || '');
                var trainingCategory = (item.trainingType || '').toLowerCase();
                if (trainingCategory === 'lp') displayType = 'Learning path';
                else if (trainingCategory === 'course') displayType = 'Course';
                var row = $('<tr></tr>');
                row.append($('<td style="text-align: center;"></td>').text(item.trainingName || ''));
                row.append($('<td style="text-align: center;"></td>').text(displayType || '-'));
                var actionCell = $('<td style="text-align: center;"></td>');
                var escapedForAttr = (item.trainingName || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                actionCell.append($('<a href="javascript:void(0);" class="btn-remove-training" data-kraid="' + kraId + '" data-training-id="' + item.trainingId + '" data-training-name="' + escapedForAttr + '" title="Remove" style="color: #d9534f; font-size: 16px; cursor: pointer; text-decoration: none;"><i class="glyphicon glyphicon-remove"></i></a>'));
                row.append(actionCell);
                $table.find('tbody').append(row);
            });
            
            // Initialize DataTable
            $table.DataTable({
                paging: false,
                searching: false,
                ordering: false,
                info: false,
                responsive: true
            });
            
            $container.show();
        } else {
            $container.hide();
        }
    },
    
    // Bind event handlers for training requirement
    bindTrainingRequirementEvents: function(kraId) {
        var self = this;
        
        // Add Training Other button
        $(document).off('click', '#btnAddTrainingOther_' + kraId);
        $(document).on('click', '#btnAddTrainingOther_' + kraId, function() {
            var otherName = $('#txtTrainingRequirementOther_' + kraId).val().trim();
            if (!otherName || otherName === '') {
                toastr.warning('Please enter a training/certification name');
                return;
            }
            
            var category = $('#txtTrainingRequirementOther_' + kraId).data('category') || '';
            self.addTrainingRequirementToList(kraId, '0', otherName, category, '');
            
            var $ddl = $('#ddlTrainingRequirement_' + kraId);
            $('#txtTrainingRequirementOther_' + kraId).val('').removeData('category').hide();
            $('#btnAddTrainingOther_' + kraId).hide();
            $('#btnCancelTrainingOther_' + kraId).hide();
            $ddl.val('').show();
            if (typeof $.fn.select2 !== 'undefined') {
                if ($ddl.hasClass('select2-hidden-accessible')) {
                    $ddl.select2('destroy');
                }
                $ddl.select2({
                    placeholder: '-- Select Training/Certification --',
                    allowClear: true,
                    width: '300px'
                });
                $ddl.val(null).trigger('change');
            }
        });
        
        // Cancel Training Other button
        $(document).off('click', '#btnCancelTrainingOther_' + kraId);
        $(document).on('click', '#btnCancelTrainingOther_' + kraId, function() {
            var $ddl = $('#ddlTrainingRequirement_' + kraId);
            $('#txtTrainingRequirementOther_' + kraId).val('').removeData('category').hide();
            $('#btnAddTrainingOther_' + kraId).hide();
            $('#btnCancelTrainingOther_' + kraId).hide();
            $ddl.val('').show();
            if (typeof $.fn.select2 !== 'undefined') {
                if ($ddl.hasClass('select2-hidden-accessible')) {
                    $ddl.select2('destroy');
                }
                $ddl.select2({
                    placeholder: '-- Select Training/Certification --',
                    allowClear: true,
                    width: '300px'
                });
                $ddl.val(null).trigger('change');
            }
        });
        
        // Remove Training button
        $(document).off('click', '#selectedTrainingList_' + kraId + ' .btn-remove-training');
        $(document).on('click', '#selectedTrainingList_' + kraId + ' .btn-remove-training', function() {
            var trainingId = $(this).data('training-id');
            var trainingName = $(this).data('training-name');
            self.removeTrainingRequirementFromList(kraId, trainingId, trainingName);
        });
        
        // Dropdown change handler - same as goal addition: auto-add on select, or show textbox for Other
        $(document).off('change', '#ddlTrainingRequirement_' + kraId);
        $(document).on('change', '#ddlTrainingRequirement_' + kraId, function() {
            var $dropdown = $(this);
            var selectedValue = $dropdown.val();
            if (!selectedValue || selectedValue === '') return;
            
            if (selectedValue === '0' || selectedValue === 0) {
                // Show textbox for custom entry (Soft Skill, Compliance, Process, Domain, Other)
                var selectedOptionText = $dropdown.find('option:selected').text();
                var $textbox = $('#txtTrainingRequirementOther_' + kraId);
                var $otherBtn = $('#btnAddTrainingOther_' + kraId);
                var $cancelBtn = $('#btnCancelTrainingOther_' + kraId);
                
                if ($dropdown.hasClass('select2-hidden-accessible')) {
                    $dropdown.select2('destroy');
                }
                $dropdown.hide();
                $textbox.data('category', selectedOptionText)
                    .attr('placeholder', 'Enter ' + selectedOptionText.toLowerCase() + ' name')
                    .show()
                    .focus();
                $otherBtn.show();
                $cancelBtn.show();
            } else {
                // Auto-add selected training (same as goal addition)
                var selectedText = $dropdown.find('option:selected').text();
                var trainingType = $dropdown.find('option:selected').data('training-type') || '';
                self.addTrainingRequirementToList(kraId, selectedValue, selectedText, '', trainingType);
                $dropdown.val(null).trigger('change');
            }
        });
    },
    
    // Add training requirement to list
    addTrainingRequirementToList: function(kraId, trainingItemId, trainingName, categoryName, trainingType) {
        // Get current training data
        var trainingData = this.getTrainingDataArray(kraId);
        
        // Duplicate check only for items with a real ID (trainingItemId > 0).
        // Custom/Other entries (trainingItemId == 0) are always allowed.
        if (trainingItemId > 0) {
            for (var i = 0; i < trainingData.length; i++) {
                if (parseInt(trainingData[i].trainingId) == trainingItemId) {
                    toastr.warning('This training requirement is already added');
                    return;
                }
            }
        }
        
        // Determine display type
        var displayTrainingType = '';
        if (trainingItemId == 0 && categoryName) {
            displayTrainingType = categoryName;
        } else if (trainingItemId > 0 && trainingType) {
            displayTrainingType = trainingType;
        }
        
        // Add to array
        trainingData.push({
            trainingId: trainingItemId.toString(),
            trainingName: trainingName,
            trainingType: displayTrainingType
        });
        
        // Save array
        this.setTrainingDataArray(kraId, trainingData);
        
        // Update DataTable
        this.initializeTrainingListDataTable(kraId, trainingData);
        
        // Update hidden fields and save draft
        this.updateTrainingRequirementHiddenFields(kraId);
    },
    
    // Remove training requirement from list
    removeTrainingRequirementFromList: function(kraId, trainingId, trainingName) {
        var trainingData = this.getTrainingDataArray(kraId);
        var updatedData = [];
        
        for (var i = 0; i < trainingData.length; i++) {
            var item = trainingData[i];
            if (!(item.trainingId == trainingId.toString() && item.trainingName === trainingName)) {
                updatedData.push(item);
            }
        }
        
        this.setTrainingDataArray(kraId, updatedData);
        this.initializeTrainingListDataTable(kraId, updatedData);
        this.updateTrainingRequirementHiddenFields(kraId);
    },
    
    // Get training data array for a specific KRA
    getTrainingDataArray: function(kraId) {
        var $table = $('#selectedTrainingList_' + kraId);
        if ($table.length === 0) return [];
        
        var trainingData = [];
        $table.find('tbody tr').each(function() {
            var $row = $(this);
            var trainingId = $row.find('.btn-remove-training').data('training-id') || '0';
            var trainingName = $row.find('td:first').text() || '';
            var trainingType = $row.find('td:nth-child(2)').text() || '';
            
            if (trainingName && trainingName.trim() !== '') {
                trainingData.push({
                    trainingId: trainingId.toString(),
                    trainingName: trainingName.trim(),
                    trainingType: trainingType.trim()
                });
            }
        });
        
        return trainingData;
    },
    
    // Set training data array for a specific KRA
    setTrainingDataArray: function(kraId, trainingData) {
        // This is handled by DataTable, but we can store in a data attribute if needed
        $('#selectedTrainingListContainer_' + kraId).data('training-data', trainingData);
    },
    
    // Update hidden fields — manager-added trainings only (persisted on EmployeeFeedback draft/submit)
    updateTrainingRequirementHiddenFields: function(kraId) {
        var mergedList = this.getTrainingDataArray(kraId);
        
        var trainingIds = [];
        var trainingNames = [];
        var trainingCategories = [];
        
        mergedList.forEach(function(item) {
            trainingIds.push(item.trainingId);
            trainingNames.push(item.trainingName);
            trainingCategories.push(item.trainingType || '');
        });
        
        var sep = '|||';
        $('#hdnTrainingItemId_' + kraId).val(trainingIds.join(sep));
        $('#hdnTrainingRequirementName_' + kraId).val(trainingNames.join(sep));
        $('#hdnTrainingCategory_' + kraId).val(trainingCategories.join(sep));
        
        // Update goal object and save draft
        var goal = this.goals.find(function(g) { return g.KRAId === kraId; });
        if (goal) {
            goal.TrainingItemId = trainingIds.join(sep);
            goal.TrainingRequirementName = trainingNames.join(sep);
            goal.TrainingCategory = trainingCategories.join(sep);
            
            // Update feedbacks object
            var feedback = this.feedbacks[kraId] || {};
            var $ta = $('.rm-feedback-textarea[data-kraid="' + kraId + '"]');
            var feedbackText = $ta.length ? this.getFeedbackFromTextarea($ta) : '';
            
            this.feedbacks[kraId] = {
                Feedback: feedbackText,
                GoalType: goal.GoalType,
                GoalDescription: goal.GoalDescription,
                Weightage: goal.Weightage,
                Measure: goal.Measure,
                AttachmentPath: goal.AttachmentPath,
                TrainingItemId: goal.TrainingItemId,
                TrainingRequirementName: goal.TrainingRequirementName,
                TrainingCategory: goal.TrainingCategory
            };
            
            // Auto-save draft if feedback exists
            if (!this.isRmFeedbackContentEmpty(feedbackText)) {
                this.saveDraftWithGoalData(kraId, feedbackText, goal);
            }
        }
    },
    
    // Bind read more/less functionality
    bindReadMore: function() {
        $(document).off('click', '.read-more-link').on('click', '.read-more-link', function(e) {
            e.preventDefault();
            var $link = $(this);
            var $container = $link.closest('.read-more-container');
            var $preview = $container.find('.read-more-preview');
            var $full = $container.find('.read-more-full');
            
            if ($full.is(':visible')) {
                $full.hide();
                $preview.show();
                $link.text('Read More');
            } else {
                $preview.hide();
                $full.show();
                $link.text('Read Less');
            }
        });
    },
    
    // Show summary and submit
    showSummaryAndSubmit: function() {
        var self = this;

        // Trigger blur on any active summernote editor to ensure its content is synced
        if ($('.note-editor.note-frame:focus').length) {
            $('.note-editor.note-frame:focus').blur();
        }
        
        // A small delay to allow blur/autosave events to complete before validation
        setTimeout(function() {
            // Sync all textarea values and training requirement data into feedbacks before validation
            $('.rm-feedback-textarea').each(function() {
                var $textarea = $(this);
                var kraId = $textarea.data('kraid');
                var feedback = self.getFeedbackFromTextarea($textarea);
                
                var goal = self.goals.find(function(g) { return g.KRAId === kraId; });
                
                if (goal) {
                    // Update feedbacks object
                    self.feedbacks[kraId] = self.feedbacks[kraId] || {};
                    self.feedbacks[kraId].Feedback = feedback;
                    
                    // Also update training data from hidden fields
                    var trainingItemId = $('#hdnTrainingItemId_' + kraId).val() || goal.TrainingItemId || '';
                    var trainingRequirementName = $('#hdnTrainingRequirementName_' + kraId).val() || goal.TrainingRequirementName || '';
                    var trainingCategory = $('#hdnTrainingCategory_' + kraId).val() || goal.TrainingCategory || '';
                    
                    self.feedbacks[kraId].TrainingItemId = trainingItemId;
                    self.feedbacks[kraId].TrainingRequirementName = trainingRequirementName;
                    self.feedbacks[kraId].TrainingCategory = trainingCategory;
                }
            });

            // Validate that ALL goals have feedback before allowing submission
            var missingGoals = [];
            self.goals.forEach(function (goal, idx) {
                var feedbackData = self.feedbacks[goal.KRAId];
                var feedbackText = (feedbackData && feedbackData.Feedback) ? feedbackData.Feedback : '';

                if (self.isRmFeedbackContentEmpty(feedbackText)) {
                    missingGoals.push(goal.GoalDescription);
                }
            });

            if (missingGoals.length > 0) {
                var missingGoalsList = missingGoals.map(function(g) { return '<li>' + g + '</li>'; }).join('');
                var errorMessage = 'Please provide RM Feedback for the following goal(s) before submitting:<ul>' + missingGoalsList + '</ul>';
                
                // Use a modal for better visibility
                var $errorModal = $('<div class="modal fade" tabindex="-1" role="dialog">' +
                    '<div class="modal-dialog" role="document">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                    '<h4 class="modal-title" style="color: #a94442;">Submission Error</h4>' +
                    '</div>' +
                    '<div class="modal-body">' + errorMessage + '</div>' +
                    '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>');

                $('body').append($errorModal);
                $errorModal.modal('show');
                $errorModal.on('hidden.bs.modal', function() {
                    $(this).remove();
                });
                return;
            }

            // At this point all goals have feedback - proceed to summary
            
            function escapeHtml(s) {
                return $('<div>').text(s == null ? '' : String(s)).html();
            }

            function trainingTypeLabel(v) {
                var s = (v == null ? '' : String(v)).trim();
                if (!s) return '';
                var low = s.toLowerCase();
                if (low === 'lp') return 'Learning Path';
                if (low === 'course') return 'Course';
                if (low === 'certification') return 'Certification';
                if (low === 'training') return 'Training';
                return s;
            }

            // Build summary HTML
            var summaryHtml = '<div class="feedback-summary">';

            self.goals.forEach(function(goal) {
                var feedbackData = self.feedbacks[goal.KRAId];
                var feedback = (feedbackData && feedbackData.Feedback) ? feedbackData.Feedback : '';

                summaryHtml += '<div class="summary-item">';
                summaryHtml += '<h5>' + (goal.GoalDescription || 'N/A') + '</h5>';
                summaryHtml += '<p><strong>RM Feedback:</strong> ' + (!self.isRmFeedbackContentEmpty(feedback) ? feedback : '<span style="color: red;">Not provided</span>') + '</p>';

                // Training Requirement preview (Developmental goals only)
                var goalTypeForTraining = '';
                if (goal.GoalType === 'O' || goal.GoalType === 'Operational') {
                    goalTypeForTraining = 'O';
                } else if (goal.GoalType === 'S' || goal.GoalType === 'Strategic Goal (AI-Themed)' || (typeof goal.GoalType === 'string' && goal.GoalType.toUpperCase().includes('STRATEGIC'))) {
                    goalTypeForTraining = 'S';
                } else {
                    goalTypeForTraining = 'D';
                }

                if (goalTypeForTraining === 'D') {
                    var kraId = goal.KRAId;
                    var trainingItemId = $('#hdnTrainingItemId_' + kraId).val() || goal.TrainingItemId || '';
                    var trainingRequirementName = $('#hdnTrainingRequirementName_' + kraId).val() || goal.TrainingRequirementName || '';
                    var trainingCategory = $('#hdnTrainingCategory_' + kraId).val() || goal.TrainingCategory || '';

                    var trainingList = self.parseTrainingFieldsToArray(trainingItemId, trainingRequirementName, trainingCategory);

                    if (trainingList.length > 0) {
                        summaryHtml += '<div style="margin-top:6px;"><strong>Training recommendations (saved with feedback):</strong>';
                        summaryHtml += '<ul style="margin:6px 0 0 18px;">';
                        for (var ti = 0; ti < trainingList.length; ti++) {
                            var row = trainingList[ti];
                            var nm = row.trainingName || '';
                            var rawType = row.trainingType || '';
                            var catLabel = trainingTypeLabel(rawType);
                            if (!nm && !catLabel) continue;
                            summaryHtml += '<li>' + escapeHtml(nm || 'N/A') + (catLabel ? ' <span style="color:#777;">(' + escapeHtml(catLabel) + ')</span>' : '') + '</li>';
                        }
                        summaryHtml += '</ul></div>';
                    } else {
                        summaryHtml += '<div style="margin-top:6px;"><strong>Training recommendations (saved with feedback):</strong> <span style="color:#999;font-style:italic;">None</span></div>';
                    }
                }

                summaryHtml += '</div>';
            });

            summaryHtml += '</div>';

            // Show confirmation modal
            var $modal = $('<div class="modal fade" id="feedbackSummaryModal" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">' +
                '<div class="modal-dialog modal-lg" role="document">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                '<h4 class="modal-title">Confirm Feedback Submission</h4>' +
                '</div>' +
                '<div class="modal-body">' + summaryHtml + '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
                '<button type="button" class="btn btn-primary" id="btnConfirmSubmit">Confirm & Submit</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');
            
            $('body').append($modal);
            $('#feedbackSummaryModal').modal('show');
            
            $('#btnConfirmSubmit').off('click').on('click', function() {
                var $confirm = $(this);
                if ($confirm.prop('disabled') || self.isSubmitting) {
                    return;
                }
                $confirm.prop('disabled', true)
                    .html('<i class="fa fa-spinner fa-spin"></i> Submitting...');
                $('#feedbackSummaryModal .modal-footer .btn-default').prop('disabled', true);
                $('#feedbackSummaryModal .modal-header .close').prop('disabled', true).css('pointer-events', 'none');
                // Keep modal visible so the Confirm button shows progress; hide only after successful submit.
                setTimeout(function() {
                    self.submitFeedback({ fromSummaryModal: true });
                }, 0);
            });
            
            $('#feedbackSummaryModal').on('hidden.bs.modal', function() {
                $(this).remove();
            });
        }, 250); // 250ms delay
    },
    
    // Submit feedback (final submission). opts.fromSummaryModal: confirm dialog stays open until success/error.
    submitFeedback: function(opts) {
        var self = this;
        opts = opts || {};

        function restoreSummaryModalFooter() {
            if (!opts.fromSummaryModal) return;
            var $m = $('#feedbackSummaryModal');
            if (!$m.length) return;
            $m.find('#btnConfirmSubmit').prop('disabled', false)
                .html('Confirm & Submit');
            $m.find('.modal-footer .btn-default').prop('disabled', false);
            $m.find('.modal-header .close').prop('disabled', false).css('pointer-events', '');
        }
        
        if (this.isSubmitting) {
            return;
        }
        
        this.isSubmitting = true;
        $('#btnSubmitFeedback').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Submitting...');
        
        var selectedyear = $('#ddlyearFeedback :selected').val();
        var empId = sessionStorage.EmployeeId;
        var appraisalCycleId = ddlAppCycle;
        var ToEmployeeId = GToEmployeeId;
        
        // Save all drafts synchronously before submitting so EmployeeKRA
        // training columns are guaranteed up-to-date for the external API call
        self.goals.forEach(function(goal) {
            var fb = self.feedbacks[goal.KRAId] || {};
            var feedbackText = fb.Feedback || '';
            if (self.isRmFeedbackContentEmpty(feedbackText)) return;

            var trainingItemId = $('#hdnTrainingItemId_' + goal.KRAId).val() || goal.TrainingItemId || '';
            var trainingRequirementName = $('#hdnTrainingRequirementName_' + goal.KRAId).val() || goal.TrainingRequirementName || '';
            var trainingCategory = $('#hdnTrainingCategory_' + goal.KRAId).val() || goal.TrainingCategory || '';

            var draftData = {
                ToEmployeeId: ToEmployeeId,
                FromEmployeeId: parseInt(empId),
                AppraisalCycleId: appraisalCycleId,
                QuestionaireId: goal.KRAId,
                Feedback: feedbackText,
                PerformCycleCheck: selectedyear,
                TrainingItemId: trainingItemId,
                TrainingRequirementName: trainingRequirementName,
                TrainingCategory: trainingCategory
            };

            $.ajax({
                url: self.getApiPath('/ManagerFeedback/SaveDraft'),
                type: 'POST',
                data: JSON.stringify(draftData),
                async: false,
                dataType: 'json',
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                    'X-EmpNo': sessionStorage.EmployeeId
                }
            });
        });
        
        var requestData = {
            ToEmployeeId: ToEmployeeId,
            FromEmployeeId: parseInt(empId),
            AppraisalCycleId: appraisalCycleId,
            PerformCycleCheck: selectedyear
        };
        
        var apiPath = self.getApiPath('/ManagerFeedback/SubmitFeedback');
        
        $.ajax({
            url: apiPath,
            type: 'POST',
            data: JSON.stringify(requestData),
            async: false,
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.TokenValue,
                'X-EmpNo': sessionStorage.EmployeeId
            },
            beforeSend: function() {
                if (opts.fromSummaryModal && $('#btnConfirmSubmit').length) {
                    $('#btnConfirmSubmit').html('<i class="fa fa-spinner fa-spin"></i> Submitting...');
                }
            },
            success: function(response) {
                if (response && response.Success) {
                    toastr.success('Feedback submitted successfully!');
                    
                    // Lock UI
                    $('.rm-feedback-textarea').prop('disabled', true);
                    $('#btnSubmitFeedback').prop('disabled', true);
                    $('#btnSaveDraft').prop('disabled', true);
                    $('#btnExpandAll, #btnCollapseAll').prop('disabled', true);
                    $('.goal-card-header').css('cursor', 'default');

                    if (opts.fromSummaryModal) {
                        $('#feedbackSummaryModal').modal('hide');
                    }
                    
                    // Redirect after 2 seconds — preserve Dashboard appraisal / sub-cycle (avoid defaulting to newest cycle)
                    setTimeout(function() {
                        try {
                            var ac = (typeof ddlAppCycle !== 'undefined' && ddlAppCycle != null && ddlAppCycle !== '') ? String(ddlAppCycle) : '';
                            var yb = '';
                            var $yf = $('#ddlyearFeedback');
                            if ($yf.length) {
                                yb = $yf.val();
                                if (yb == null || yb === undefined) yb = '';
                                yb = String(yb);
                            }
                            if (ac) sessionStorage.setItem('dashboardRestoreAppraisalCycleId', ac);
                            if (yb) sessionStorage.setItem('dashboardRestoreYearBreakCheck', yb);
                        } catch (eRestore) { /* ignore */ }
                        window.location.href = '/Dashboard/Index';
                    }, 2000);
                } else {
                    var errorMsg = (response && response.ErrorMessage) ? response.ErrorMessage : 'Error submitting feedback. Please try again.';
                    toastr.error(errorMsg);
                    $('#btnSubmitFeedback').prop('disabled', false).html('<i class="glyphicon glyphicon-ok"></i> Submit');
                    self.isSubmitting = false;
                    restoreSummaryModalFooter();
                }
            },
            error: function(xhr, statusText, errorThrown) {
                var errorMsg = 'Error submitting feedback: ' + (xhr.responseJSON ? xhr.responseJSON.Message : errorThrown);
                toastr.error(errorMsg);
                $('#btnSubmitFeedback').prop('disabled', false).html('<i class="glyphicon glyphicon-ok"></i> Submit');
                self.isSubmitting = false;
                restoreSummaryModalFooter();
            }
        });
        // Do not clear isSubmitting on success — allows retry only via error paths above; prevents double-submit if user clicked Confirm multiple times before redirect.
    },
    
    // Show autosave indicator
    showAutosaveIndicator: function() {
        var $indicator = $('.autosave-indicator');
        if ($indicator.length === 0) {
            $indicator = $('<div class="autosave-indicator"><i class="glyphicon glyphicon-floppy-saved"></i> Draft saved</div>');
            $('body').append($indicator);
        }
        
        $indicator.addClass('show');
        setTimeout(function() {
            $indicator.removeClass('show');
        }, 2000);
    },
    
    // Bind attachment download handlers
    bindAttachmentDownloadHandlers: function() {
        var self = this;
        
        // Individual attachment download
        $(document).off('click', '.download-self-assessment-attachment').on('click', '.download-self-assessment-attachment', function(e) {
            e.preventDefault();
            var attachmentId = $(this).data('attachment-id');
            if (attachmentId) {
                self.downloadSelfAssessmentAttachment(attachmentId);
            }
        });
    },
    
    // Download individual self-assessment attachment
    downloadSelfAssessmentAttachment: function (attachmentId) {
        debugger
        var svrPath = CONFIG.get('SERVERNAME');
        var apiPath = svrPath + 'EmployeeKRA/DownloadSelfAssessmentAttachment?AttachmentId=' + attachmentId;
        
        // Get original filename from the attachment data stored in selfAssessmentAttachments
        var originalFileName = 'attachment';
        var allAttachments = ManagerFeedbackCards.selfAssessmentAttachments || {};
        for (var kraId in allAttachments) {
            var attachments = allAttachments[kraId];
            for (var i = 0; i < attachments.length; i++) {
                if (attachments[i].AttachmentId == attachmentId) {
                    originalFileName = attachments[i].OriginalFileName || 'attachment';
                    break;
                }
            }
            if (originalFileName !== 'attachment') break;
        }
        
        // Show loading message
        toastr.info('Downloading attachment...', '', { timeOut: 2000 });
        
        // Use fetch to download with authorization header
        fetch(apiPath, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.TokenValue
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Download failed');
            }
            
            // Try to get filename from Content-Disposition header
            var contentDisposition = response.headers.get('Content-Disposition');
            var fileName = originalFileName;
            
            if (contentDisposition) {
                var fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                    // Decode URI if needed
                    try {
                        fileName = decodeURIComponent(fileName);
                    } catch (e) {
                        // If decoding fails, use as is
                    }
                }
            }
            
            return response.blob().then(blob => ({ blob: blob, fileName: fileName }));
        })
        .then(({ blob, fileName }) => {
            var url = window.URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.style.display = 'none';
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toastr.success('Attachment downloaded successfully');
        })
        .catch(error => {
            console.error('Download error:', error);
            toastr.error('Failed to download attachment');
        });
    },
    
    // Download all self-assessment attachments
    downloadAllSelfAssessmentAttachments: function () {
        debugger
        var self = this;
        var empId = sessionStorage.EmployeeId;
        var appraisalCycleId = ddlAppCycle;
        var selectedyear = $('#ddlyearFeedback :selected').val();
        var ToEmployeeId = GToEmployeeId;
        var selfAssCycleId = selectedyear ? parseInt(selectedyear) : null;
        
        if (!empId || !appraisalCycleId || !ToEmployeeId) {
            toastr.error('Missing required parameters');
            return;
        }

        var getAttachmentCount = function() {
            var total = 0;
            var attachmentsByKRA = self.selfAssessmentAttachments || {};
            Object.keys(attachmentsByKRA).forEach(function(kraIdKey) {
                var attachmentList = attachmentsByKRA[kraIdKey];
                if (Array.isArray(attachmentList)) {
                    total += attachmentList.length;
                }
            });
            return total;
        };

        var executeDownload = function() {
            var svrPath = CONFIG.get('SERVERNAME');
            var apiPath = svrPath + 'EmployeeKRA/DownloadAllSelfAssessmentAttachments?EmployeeId=' + ToEmployeeId + '&AppraisalCycleId=' + appraisalCycleId + (selfAssCycleId ? '&SelfAssessmentCycleId=' + selfAssCycleId : '');

            toastr.info('Preparing download...', '', { timeOut: 2000 });

            fetch(apiPath, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.TokenValue
                }
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Download failed');
                }

                var contentType = (response.headers.get('content-type') || '').toLowerCase();
                // If backend returns JSON/text (common when no files), show business message instead of downloading.
                if (contentType.indexOf('application/json') !== -1 || contentType.indexOf('text/plain') !== -1 || contentType.indexOf('text/html') !== -1) {
                    return response.text().then(function(bodyText) {
                        throw new Error(bodyText || 'No attachments provided by Employee');
                    });
                }

                return response.blob();
            })
            .then(function(blob) {
                // Guard against empty file responses.
                if (!blob || blob.size === 0) {
                    toastr.warning('No attachments provided by Employee');
                    return;
                }
                // Some backends return an empty ZIP even when there are no attachments.
                // Prevent downloading placeholder ZIP archives.
                if (blob.size <= 200) {
                    toastr.warning('No attachments provided by Employee');
                    return;
                }
                var url = window.URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.style.display = 'none';
                var zipFileName = 'SelfAssessment_Attachments_' + ToEmployeeId + '_' + appraisalCycleId + '_' + new Date().getTime() + '.zip';
                link.setAttribute('download', zipFileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toastr.success('All attachments downloaded successfully');
            })
            .catch(function(error) {
                var message = (error && error.message) ? error.message : 'Failed to download attachments';
                console.error('Download error:', message);
                var lowerMessage = message.toLowerCase();
                if (lowerMessage.indexOf('no attachment') !== -1 || lowerMessage.indexOf('no records') !== -1 || lowerMessage.indexOf('not found') !== -1) {
                    toastr.warning('No attachments provided by Employee');
                } else {
                    toastr.error('Failed to download attachments');
                }
            });
        };

        // Always refresh attachment data before validating, so button behavior reflects latest state.
        self.loadSelfAssessmentAttachments(function() {
            var attachmentCount = getAttachmentCount();
            if (attachmentCount === 0) {
                toastr.warning('No attachments provided by Employee');
                return;
            }
            executeDownload();
        });
    }

};

// Initialize on document ready
if (typeof $ !== 'undefined') {
    $(document).ready(function() {
        // Wait a bit for the DOM to be fully ready
        setTimeout(function() {
            if ($('#goalsCardsContainer').length > 0) {
                ManagerFeedbackCards.init();
            } else {
                console.warn('ManagerFeedbackCards: goalsCardsContainer not found');
            }
        }, 100);
    });
}
