        $(document).ready(function(){
            window.location.hash = "#step-1";
            $('#articleNotFoundAlert').on('close.bs.alert', function () {
                $('#smartwizard').smartWizard("reset");
            });
            $('#annotationsNotFoundAlert').on('close.bs.alert', function () {
                $('#smartwizard').smartWizard("reset");
            });
            var ontologies = [
            { id: 'CHEBI', name: 'Chemical entities of biological interest'},
            { id: 'GO', name: 'Gene Ontology'},
            { id: 'PW', name: 'Pathway ontology'},
            { id: 'MO', name: 'MGED Ontology'},
            { id: 'PR', name: 'Protein Ontology'},
            { id: 'MDDB', name: 'Master Drug Data Base'},
            { id: 'NDDF', name: 'National Drug Data File'},
            { id: 'NDFRT', name: 'National Drug File'},
            { id: 'MEDLINEPLUS', name: 'MedlinePlus Health Topics'},
            { id: 'SNOMEDCT', name: 'SNOMED Clinical Terms'},
            { id: 'SYMP', name: 'Symptom Ontology'},
            { id: 'MEDDRA', name: 'MedDRA'},
            { id: 'MESH', name: 'Medical Subject Headings'},
            { id: 'OMIM', name: 'Online Mendelian Inheritance in Man'},
            { id: 'FMA', name: 'Foundational Model of Anatomy'},
            { id: 'ICD10', name: 'International Classification of Disease'},
            { id: 'OBI', name: 'Ontology for Biomedical Investigations'},
            { id: 'PO', name: 'Plant Ontology'},
            { id: 'NCIT', name: 'NCI Thesaurus'},
            { id: 'NCBITAXON', name: 'NCBI organismal classification'},
            { id: 'suicideo', name: 'Suicidology Ontology'}
            ];
            $("#ontology").typeahead({ source: ontologies});
            $("#conceptOntology").typeahead({
                source: ontologies,
                afterSelect: function(item){
                $("#bioportalSelect").attr('placeholder', 'Start typing a concept from ' + item.name)
                $("#bioportalSelect").addClass("bp_form_complete-" + item.id +"-name");
                $("#bioportalSelect").removeAttr("disabled");
                $("#ontologyName").html(item.name);
                formComplete_setup_functions();
            }});

            $("#smartwizard").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection, stepPosition) {
                if (stepNumber === 0 ) {
                    conceptIdElement = document.getElementById('a_bioportal_concept_id');
                    if (conceptIdElement == null) {
                        return false;
                    }
                    else if(conceptIdElement.value) {
                        $("#conceptInput").removeClass("has-error");
                        return true;
                    } else {
                        $("#conceptInput").addClass("has-error");
                        return false;
                    }
                } else if (stepNumber === 1) {
                    var ontology = document.getElementById('ontology').value;
                    var concept = document.getElementById('a_bioportal_concept_id').value;
                    $("#timeAlert").attr("data-content-url", "http://bioteaexplorer.service.labs.linkingdata.io/targetstats?ontology=" + ontology + "&concept=" + concept);
                } else if (stepNumber === 2) {
                    $("#timeAlert").hide();
                    $( "#articlesNumber" ).html( '' );
                    $( "#annotationsNumber" ).html( '' );
                }
            });

            
            // Step show event 
            $("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection, stepPosition) {
               //alert("You are on step "+stepNumber+" now");
               if(stepPosition === 'first'){
                   $("#prev-btn").addClass('disabled');
               }else if(stepNumber === 3){
                   $("#next-btn").addClass('disabled');
                   var ontology_element = document.getElementById('ontology');
                   var concept_element = document.getElementById('a_bioportal_concept_id');
                   if (ontology_element == null || concept_element == null)
                   {
                    $('#smartwizard').smartWizard("reset");
                   } else {
                    var ontology = ontology_element.value;
                    var concept = concept_element.value;
                    chart(ontology, concept);
                    statistics(ontology, concept);
                   }
               } else if (stepNumber === 2) {

                var ontology_element = document.getElementById('ontology');
                var concept_element = document.getElementById('a_bioportal_concept_id');

                if (ontology_element == null || concept_element == null)
                {
                 $('#smartwizard').smartWizard("reset");
                } else {
                    var ontology = ontology_element.value;
                    var concept = concept_element.value;
                    var opts = {
                      lines: 9, // The number of lines to draw
                      length: 9, // The length of each line
                      width: 5, // The line thickness
                      radius: 14, // The radius of the inner circle
                      color: '#EE3124', // #rgb or #rrggbb or array of colors
                      speed: 1.9, // Rounds per second
                      trail: 40, // Afterglow percentage
                      className: 'spinner', // The CSS class to assign to the spinner
                    };
                    var spinner_3 = new Spinner(opts).spin(document.getElementById("previewData"));
                    $.get( "http://bioteaexplorer.service.labs.linkingdata.io/targetstats?ontology=" + ontology + "&concept=" + concept, function( data ) {
                      spinner_3.stop();
                      if(data['articles'] == 0){
                        $("#articleNotFoundAlert").fadeTo(2000, 500).slideUp(1000, function(){
                            $("#articleNotFoundAlert").slideUp(500);
                            $('#smartwizard').smartWizard("reset");
                        });
                      }
                      if(data['annotations'] == 0){
                        $("#annotationNotFoundAlert").show();
                      }
                      if(data['annotations'] > 2000 || data['articles'] > 100){
                        $("#timeAlert").show();
                      }
                      $( "#articlesNumber" ).html( data['articles'] );
                      $( "#annotationsNumber" ).html( data['annotations'] );
                    });
                }
               } else{
                   $("#prev-btn").removeClass('disabled');
                   $("#next-btn").removeClass('disabled');
               }
            });
            
            var btnCancel = $('<button></button>').text('Reset')
                                             .addClass('btn btn-warning')
                                             .on('click', function(){ 
                                                $("#timeAlert").hide();
                                                $( "#articlesNumber" ).html( '' );
                                                $( "#annotationsNumber" ).html( '' );
                                                $('#smartwizard').smartWizard("reset"); 
                                            });                         
            
            
            // Smart Wizard
            $('#smartwizard').smartWizard({ 
                    selected: 0, 
                    theme: 'default',
                    transitionEffect:'fade',
                    showStepURLhash: true,
                    toolbarSettings: {toolbarPosition: 'both',
                                      toolbarExtraButtons: [btnCancel]
                                    }
            });
                                         
            
            // External Button Events
            $("#reset-btn").on("click", function() {
                // Reset wizard
                $('#smartwizard').smartWizard("reset");
                return true;
            });
            
            $("#prev-btn").on("click", function() {
                // Navigate previous
                $('#smartwizard').smartWizard("prev");
                return true;
            });
            
            $("#next-btn").on("click", function() {
                // Navigate next
                $('#smartwizard').smartWizard("next");
                return true;
            });
            
            $("#theme_selector").on("change", function() {
                // Change theme
                $('#smartwizard').smartWizard("theme", $(this).val());
                return true;
            });
            
            // Set selected theme on page refresh
            $("#theme_selector").change();
        });   