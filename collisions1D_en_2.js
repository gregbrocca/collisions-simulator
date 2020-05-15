class squareG
{
    constructor(x, y, side, direction, mass, color)
    {
        this.side = side;
        this.x = x;
        this.y = y;

        let angle = 0;
        if (direction == "right") //angoli in radianti
            angle = 0;
        else if(direction == "left")
            angle = Math.PI;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);

        this.mass = mass;


        this.color = color;
        
    }
    draw() 
    {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
        ctx.rect(Math.round(this.x), Math.round(this.y), this.side, this.side);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
		drawGame()
		{
			ctxGame.lineWidth = 3;
			ctxGame.beginPath();
			ctxGame.strokeStyle = 'rgba(0, 0, 0, 1)';
			ctxGame.rect(Math.round(this.x), Math.round(this.y), this.side, this.side);
			ctxGame.fillStyle = this.color;
			ctxGame.fill();
			ctxGame.stroke();
			ctxGame.closePath();
		}
    speed() 
    {
        return Math.sqrt(this.dx * this.dx); //Pitagora
    }
    angolo() 
    {
        return Math.atan2(this.dy, this.dx);
    }
    onGround() 
    {
        return (this.y >= canvas.height);
    }
    erase()
    {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.rect(Math.round(this.x), Math.round(this.y), this.side, this.side)
        ctx.fillStyle = 'rgb(215, 235, 240)';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}






let clearCanvGame = true;

const gameCanvas = document.getElementById("minigameCanvas");
const ctxGame = gameCanvas.getContext("2d");

let startGame = false;
let firstTimeGame = true;

function drawObjectsGame(){
	for (let obj in arrayObjGame)
		arrayObjGame[obj].drawGame();
}


var dist2; //Distanza posizione obiettivo

function drawGoal() //800 Ã¨ il punto di arrivo, con uno scarto di +-15, si puo anche fare variabile dall'utente
{
	let img_bers = document.getElementById("bersaglio");
	ctxGame.drawImage(img_bers, dist2 - 45, gameCanvas.height - 80, 90, 60);
}

var coeff2;

function moveGameObjects() //Muovere gli oggetti nel minigioco
{
	for (let i = 0; i < arrayObjGame.length; i++)
	{
		let value = 9.81 * coeff2 * 0.01684;
		let ob = arrayObjGame[i];
		if (ob.x > 3 && ob.x < (gameCanvas.width - arrayObjGame[i].side - 2))
		{
			ob.x += (ob.dx * 1);
			if (ob.dx > 0) //decremento se in presenza di attrito
        {
            if (ob.dx > value)
                ob.dx  -= value;
            else {
                ob.dx = 0;
                if(i == 1) document.getElementById("rest").classList.add('blink1');
                else if(!collidedG) document.getElementById("rest").classList.add('blink1');
            }
        }
        else if (ob.dx < 0) //incremento se in presenza di attrito
        {
            if(ob.dx < -value)
                ob.dx += value;
            else {    
                ob.dx = 0;
                if(i == 1) document.getElementById("rest").classList.add('blink1'); 
                else if(!collidedG) document.getElementById("rest").classList.add('blink1');
            }
        }
		}
		else if(i == 1) {
			document.getElementById("rest").classList.add('blink1');
		}
	}
}

let collidedG = false;

function squareCollisionGame()
{
	let square1 = arrayObjGame[0];
	let square2 = arrayObjGame[1];
	 let dist = distance(square1, square2);
    if(dist < (square1.side + Math.abs(square1.dx-square2.dx)) && !collidedG) 
    {
        square1.x += (distance(square1, square2) - square1.side); //attacca gli spigoli dei cubi

        let angle1 = square1.angolo();
        let angle2 = square2.angolo();

        let m1 = square1.mass;
        let m2 = square2.mass;

        let v1 = square1.speed();
        let v2 = square2.speed();

        let qmi = (m1 * v1 * Math.cos(angle1)) + (m2 * v2 * Math.cos(angle2)); //qm iniziale
        let dvi = Math.abs((v1 * Math.cos(angle1)) - (v2 * Math.cos(angle2))); //val. ass. vel. rel. iniz.
        //let c = document.getElementById("slider2").value / 100; //coefficiente di restituzione

        let dx1F = (qmi - (m2 * dvi * 1)) / (m1 + m2);
        let dx2F = (qmi + (m1 * dvi * 1)) / (m1 + m2);

        square1.dx = dx1F;
        square2.dx = dx2F;
        collidedG = true; 
    }
}

let arrivato = false;

function goalControl() //Controllo dell'arrivo al traguardo
{
	let square2 = arrayObjGame[1];
	if(square2.x >= dist2-square2.side && square2.x <= dist2 && square2.dx == 0 && !arrivato)
	{
		arrivato = true;
		//alert("Complimenti! hai effettuato i calcoli giusti!Rigioca cliccando 'Genera nuovo testo' oppure corri a vantarti del risultato dal tuo professore!");
		alert("Congratulations! You obtained the right speed! Play again clicking 'Generate new text' or enjoy your results!");
		document.getElementById("generant").classList.add('blink1');
	}

}

function drawGame() //Funzione base
{
	var animate = requestAnimationFrame(drawGame);
	if (clearCanvGame) clearGameCanvas();
	
	if(startGame)
	{
		moveGameObjects();
		squareCollisionGame();
	}
	goalControl();
	
	drawSystemGame();
	drawGoal();
	drawObjectsGame();
	if(hidden) {
		cancelAnimationFrame(animate);
		hidden = false;
	}
}

function drawSystemGame() //disegna asse x
{ 
    ctxGame.lineWidth = 3;
    ctxGame.beginPath();
    ctxGame.strokeStyle = "black";
    ctxGame.lineCap = "round";

    ctxGame.moveTo(0, gameCanvas.height - 50);
    ctxGame.lineTo(gameCanvas.width, gameCanvas.height - 50);
    ctxGame.moveTo(gameCanvas.width, gameCanvas.height - 50);
    ctxGame.lineTo(gameCanvas.width - 20, gameCanvas.height - 62);
    ctxGame.moveTo(gameCanvas.width, gameCanvas.height - 50);
    ctxGame.lineTo(gameCanvas.width - 20, gameCanvas.height - 38);

    ctxGame.moveTo(gameCanvas.width - 35, gameCanvas.height - 95);
    ctxGame.lineTo(gameCanvas.width - 35 + 20, gameCanvas.height - 95 + 20);
    ctxGame.moveTo(gameCanvas.width - 35, gameCanvas.height - 75);
    ctxGame.lineTo(gameCanvas.width - 35 + 20, gameCanvas.height - 95);

    ctxGame.stroke();
    ctxGame.closePath();
}

var massa1Game;
var massa2Game;
var vel1Game;

function SetGameProperties()
{
	if(firstTimeGame)
	{
		arrayObjGame[0].mass = massa1Game;
		arrayObjGame[1].mass = massa2Game;
		
		arrayObjGame[0].side = Math.round(Math.log(massa1Game + 1)) * 30;
		arrayObjGame[1].side = Math.round(Math.log(massa2Game + 1)) * 30;
		
		
		arrayObjGame[0].x = 300 - (arrayObjGame[0].side / 2);
		arrayObjGame[1].x = gameCanvas.width - 700 - (arrayObjGame[1].side / 2);
		
		arrayObjGame[0].y = gameCanvas.height - 50 - (arrayObjGame[0].side);
		arrayObjGame[1].y = gameCanvas.height - 50 - (arrayObjGame[1].side);
		
		arrayObjGame[0].dx = parseFloat(document.getElementById("vel1Game").value);
		console.log(arrayObjGame[0].dx);
		arrayObjGame[1].dx = 0;
	}
}

let dist1;

function generaTestoGame()
{
	restartGame();
	var testo;
	massa1Game = Math.floor(Math.random() * 20) + 1;
	massa2Game = Math.floor(Math.random() * 20) + 1;
	dist2 = Math.floor(Math.random() * 350) + 700;
	coeff2 = Math.round(Math.random() * 31) / 100;
	let convertValue = 0.01694915254;
	SetGameProperties();
	//console.log(arrayObjGame[0].side, arrayObjGame[1].side);
	testo = "Which speed should the brown block has, with a mass of <i>'";
	testo += massa1Game;
	testo += "' kg</i>, to make the blue block stop exactly on the target? The blue block is initially still and its mass is <i>'";
	testo += massa2Game;
	testo += "' kg</i><br>The dynamic friction coefficent between the blocks and the surface is <i>'";
	testo += coeff2;
	testo += "'</i>.<br>The two blocks are distant  <i>'";
	
	testo += Math.round(((arrayObjGame[1].x - arrayObjGame[0].x - arrayObjGame[0].side) * convertValue) * 100) / 100;
	testo += "' m</i>, and the brown block is <i>'";
	testo += Math.round(((dist2 - arrayObjGame[1].x - arrayObjGame[1].side) * convertValue) * 100) / 100;
	testo += "' m</i> far from the target<br>The collision between the two objects is <strong><i>totally elastic</i></strong>.";
	
	document.getElementById("testoGame").style.visibility = "visible";
	document.getElementById("testoGame").innerHTML = testo;
	document.getElementById("vel1Game").value = '';
	document.getElementById("generant").classList.remove('blink1');
}

var hidden = false;

function hideMinigame() {

	//rimpicciolisci e allinea a sx i tasti principali
	document.getElementById("testoGame").style.visibility = "hidden";
	document.getElementById("minigame").style.display = 'none';
	document.getElementById("min").disabled = false;

	hidden = true;

	document.getElementById("min").classList.add('button1');
	document.getElementById("min").classList.remove('button');
	document.getElementById("minPar").style.textAlign = "left";

	document.getElementById("hideM").classList.add('button1');
	document.getElementById("hideM").classList.remove('button');
}

function minigame() {

alert("Read carefully the exercise's text, insert the speed value in the input box and press 'Start' to check whether your result is right... Good luck!")

arrayObjGame = [];

document.getElementById("minigame").style.display = "inline";

document.getElementById("min").disabled = "true";

document.getElementById("min").classList.add('button');
document.getElementById("min").classList.remove('button1');
document.getElementById("minPar").style.textAlign = "center";


document.getElementById("hideM").classList.add('button');
document.getElementById("hideM").classList.remove('button1');


//Creiamo i due oggetti
arrayObjGame[arrayObjGame.length] = new squareG(300 - 20, canvas.height - 90, 40, "right", 100, "chocolate");
arrayObjGame[arrayObjGame.length] = new squareG(canvas.width - 730, canvas.height - 110, 60, "left", 100, "DEEPSKYBLUE");

restartGame();

generaTestoGame();

drawGame();

}

function clearGameCanvas()
{
	ctxGame.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function prova()
{
	if(startGame) alert("Press 'Restart' to retry");
	else if (document.getElementById("vel1Game").value)
	{
		startGame = !startGame;
		SetGameProperties();
		firstTimeGame = false;
	}
	else
		alert("Input missing!");
	
}

function restartGame()
{
		arrayObjGame[0].x = 300 - (arrayObjGame[0].side / 2);
    arrayObjGame[0].y = gameCanvas.height - 50 - (arrayObjGame[0].side);
    arrayObjGame[1].x = gameCanvas.width - 700 - (arrayObjGame[1].side / 2);
    arrayObjGame[1].y = gameCanvas.height - 50 - (arrayObjGame[1].side);
    arrayObjGame[0].dx = NaN;
    arrayObjGame[1].dx = 0;
		/*arrayObjGame[0].dy = 0;
    arrayObjGame[1].dy = 0;*/
    arrayObjGame[0].mass = massa1Game;
    arrayObjGame[1].mass = massa2Game;
    startGame = false;   
    firstTimeGame = true;
   // setGameProperties(); causa problemi
    collidedG = false;
		arrivato = false;
		document.getElementById("rest").classList.remove('blink1');
		document.getElementById("generant").classList.remove('blink1');
}










