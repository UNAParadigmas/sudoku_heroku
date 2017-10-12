/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

function AjaxRequest(url) {
  var deferredObject = $.Deferred();

  var request = $.ajax({
    url: url,
    type: "GET",
    dataType: 'json',
  });

  request.done(function (response) {
    deferredObject.resolve(response);
  });

  request.fail(function (response) {
    deferredObject.reject(response);
  });

  return deferredObject.promise();
}



function chart(){

  var vec = [];
  AjaxRequest("api//historial/dificultad/0/identificacion/" + usuario._id)
    .then(facil => vec.push(JSON.parse(facil)))
    .then(AjaxRequest("api//historial/dificultad/1/identificacion/" + usuario._id)
      .then(medio => { vec.push(JSON.parse(medio)); }))
    .then(AjaxRequest("api//historial/dificultad/2/identificacion/" + usuario._id)
      .then(dificil => {vec.push(JSON.parse(dificil))
        console.log("DIFICIL; ", JSON.parse(dificil));
        JSON.stringify
      }))
    .then(() => {
      new Chart(document.getElementById("line-chart"), {
        type: 'line',
        data: {
          labels: Array.from({ length: 10 }, (e, i) => i + 1),
          datasets: [{
            data: vec[0].map(x => x.tiempo),
            label: "Easy",
            borderColor: "#088A08",
            fill: false
          }, {
            data: vec[1].map(x => x.tiempo),
            label: "Normal",
            borderColor: "#FF8000",
            fill: false
          }, {
            data: vec[2].map(x => x.tiempo),
            label: "Hard",
            borderColor: "#0B0B61",
            fill: false
          }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Time spent (minutes) in the last 10 games by difficulty.'
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Games'
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Minutes'
              }
            }]
          }
        }
      });
    })

}



function chart2(){


  AjaxRequest("api//historial/" + usuario._id)
    .then(vector => {
      new Chart(document.getElementById("pie-chart"), {
        type: 'pie',
        data: {
          labels: ["Easy", "Normal", "Hard"],
          datasets: [{
            label: "Level",
            backgroundColor: ["#088A08", "#FF8000", "#0B0B61"],
            data: JSON.parse(vector)
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Games won by difficulty.'
          }
        }
      });
    });
}