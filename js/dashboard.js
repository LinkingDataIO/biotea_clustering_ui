var resetCanvas = function () {
  $('#year').remove();
  $('#journal').remove();
  $('#yearContainer').append('<canvas id="year" width="400" height="400"><canvas>');
  $('#journalContainer').append('<canvas id="journal" width="400" height="400"><canvas>');
};

function statistics(ontology, concept){
  resetCanvas();

  $.get( "http://bioteaexplorer.service.labs.linkingdata.io/dashboard?ontology=" + ontology + "&concept=" + concept, function( data ) {
      var ctxYear = $("#year");
      myChartYear = new Chart(ctxYear, {
          type: 'bar',
          data: {
              labels: data['year']['labels'],
              datasets: [{
                  label: 'Articles by year',
                  data: data['year']['values'],
                  borderWidth: 1,
                  backgroundColor: palette('tol', data['year']['values'].length).map(function(hex) {
                     return '#' + hex;
                   })
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });

      var ctxJournal = $("#journal");
      myCharJournal = new Chart(ctxJournal, {
          type: 'pie',
          data: {
              labels: data['journal']['labels'],
              datasets: [{
                  data: data['journal']['values'],
                  backgroundColor: palette('tol', data['journal']['values'].length).map(function(hex) {
                     return '#' + hex;
                   })
              }]
          }
      });

  });
}
