var model;
(async () => {
  model = await tf.loadLayersModel('assets/model.json');
  console.log("model loaded");
})();

(function() {
    document.getElementById("paint").style.border = "thick solid #000";
    var canvas = document.querySelector('#paint');
    var ctx = canvas.getContext('2d');

    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    canvas.width = 280;
    canvas.height = 280;

    var mouse = {x: 0, y: 0};
    var last_mouse = {x: 0, y: 0};

    /* Mouse Capturing Work */
    canvas.addEventListener('mousemove', function(e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
    }, false);


    /* Drawing on Paint App */
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ff0000';

    canvas.addEventListener('mousedown', function(e) {
        canvas.addEventListener('mousemove', onPaint, false);
    }, false);

    canvas.addEventListener('mouseup', function() {
        canvas.removeEventListener('mousemove', onPaint, false);
    }, false);

    var onPaint = function() {
        ctx.beginPath();
        ctx.moveTo(last_mouse.x, last_mouse.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.closePath();
        ctx.stroke();
    };
  
}());

function clearCanvas() {
  var canvas = document.querySelector('#paint');
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

var data = [];
var ctx = document.getElementById("myChart").getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
   data:{
   labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        datasets: [{
            label: 'Percentage',
            data: data,
            borderWidth: 1
        }]
},
    options: {
        scales: {
            
            yAxes: [{
            ticks: {
            
                   min: 0,
                   max: 100,
                   callback: function(value){return value+ "%"}
                },  
								scaleLabel: {
                   display: true,
                   labelString: "Percentage"
                }
            }]
        },
      responsive: false
    }
});

function predict() {
  var canvas = document.querySelector('#paint');
  const input = tf.browser.fromPixels(canvas, 1);
  const resized = tf.image.resizeBilinear(input, [28, 28]);
  const test = tf.cast(resized, 'float32');
  var test1 = [];
  for (var i = 0; i < test.dataSync().length; i++) {
      test1.push(test.dataSync()[i] / 255);
  }
  const t4d = tf.tensor4d(Array.from(test1), [1, 28, 28, 1]);
  var results = model.predict(t4d).dataSync();
  console.log(results);
  var prediction = tf.argMax(results).dataSync();
  document.getElementById("prediction").innerHTML = prediction;
  
  data = [];
  for(var i = 0; i < results.length; i++) {
    data.push(results[i] * 100);
  }
  
  myChart.data.datasets[0].data = data;
  myChart.update();

}