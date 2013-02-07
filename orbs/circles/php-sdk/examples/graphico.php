<script src="js/prototype.js"></script>
<script src="js/raphael.js"></script>

<script src="js/graphico.js"></script>

<script>
console.log($('streamgraph3'));

var streamgraph = new Grafico.StreamGraph($('streamgraph3'),
{
  movie1: [30, 33, 20, 10,  5,  3,  2,  1,  0,  0,  0,  0,  0,  0,  0,  0],
  movie2: [10, 15, 25, 28, 29, 26, 20, 10,  3,  1,  1,  0,  0,  0,  0,  0],
  movie3: [ 0,  4,  6,  8, 11, 13, 11,  9,  3,  0,  0,  0,  0,  0,  0,  0],
  movie4: [ 0,  0,  0,  1,  4,  9, 19, 28, 35, 44, 45, 45, 35, 18,  6,  3],
  movie5: [ 0,  0,  0,  0,  0,  0,  0,  1,  2,  2,  8, 20, 26, 29, 30, 31]
},
{
  stream_line_smoothing: 'simple',
  stream_smart_insertion: true,
  stream_label_threshold: 20,
  datalabels: {
    movie1: "James Bond",
    movie2: "Bourne Ultimatum",
    movie3: "Harry Potter",
    movie4: "Kill Bill",
    movie5: "Return of the Mummie"
  }
});


</script>
<body>
<div id="streamgraph3" style="width: 500px;
height: 170px"></div>
</body>

