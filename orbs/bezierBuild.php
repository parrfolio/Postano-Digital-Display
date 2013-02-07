<html>
<head>
	<style type="text/css">
		.bar {
			width:10px;
			height:100px;
			margin-left:5px;
			border: 1px solid black;
			float:left;
		}
		
		.fill{
			width:100%;
			height:0;
			background-color:black;
		}
		
			
	</style>
</head>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>


<script>

//====================================\\
// 13thParallel.org Beziér Curve Code \\
//   by Dan Pupius (www.pupius.net)   \\
//====================================\\

coord = function (x,y) {
  if(!x) var x=0;
  if(!y) var y=0;
  return {x: x, y: y};
}

function B1(t) { return t*t*t }
function B2(t) { return 3*t*t*(1-t) }
function B3(t) { return 3*t*(1-t)*(1-t) }
function B4(t) { return (1-t)*(1-t)*(1-t) }

function getBezier(percent,C1,C2,C3,C4) {
  var pos = new coord();
  pos.x = C1.x*B1(percent) + C2.x*B2(percent) + C3.x*B3(percent) + C4.x*B4(percent);
  pos.y = C1.y*B1(percent) + C2.y*B2(percent) + C3.y*B3(percent) + C4.y*B4(percent);
  return pos;
}

var start=coord(0,0);
var end=coord(115,0);
var c1=coord(1.6,1);
var c2=coord(98.4,1.6);

var iter=-1;
for(var i=0;i<1;i+=.01){
	iter++;
	point=getBezier(i,start,c1,c2,end);
	
	$('html').append('<div class=bar><div class=fill>');
	$('.fill').eq(iter).height(point.y*100);
}


</script>
</html>