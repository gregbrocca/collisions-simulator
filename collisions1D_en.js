const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d"); //per disegno 2D
let clearCanv = true;
let arrayObj = [];
let firstTime = true; //vedere setProperties()
var v1; 
var v2;
let start = false; //vedi begin()
let cdm = false; //disegna cdm
let m1;
let m2;
let cdx; //coordinata x centro di massa
let num; //vedi qm1_calc(), qm2_calc()
let vec_obj = false; //velocitÃ  oggetti
let vec_cdm = false; //velocitÃ  cdm
let step = false; //per pulsante Step
let back = false; //per pulsante Back
var v1i; //v1 iniziale
var v2i; //v2 iniziale
let finished1 = false; //indica fine movimento oggetto 1
let finished2 = false; //indica fine movimento oggetto 2
var startTime = 0;
var starta = 0;
var end = 0;
var diff = 0;
var timerID = 0;
let collided = false; //evita problemi post-collisione
let soluzione = false;
let soluzione2 = false;
let testob = false;
let testob2 = false;

class square
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

arrayObj[arrayObj.length] = new square(300 - 20, canvas.height - 90, 40, "right", 100, "chocolate");
arrayObj[arrayObj.length] = new square(canvas.width - 430, canvas.height - 110, 60, "left", 100, "DEEPSKYBLUE");

draw();

function clearCanvas() 
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function squareCollision() //aggiorna velocitÃ  in seguito a collisione
{
    let square1 = arrayObj[0];
    let square2 = arrayObj[1];
    let dist = distance(square1, square2);
    if(dist < (square1.side + Math.abs(square1.dx-square2.dx)) && !collided) 
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
        let c = document.getElementById("slider2").value / 100; //coefficiente di restituzione

        let dx1F = (qmi - (m2 * dvi * c)) / (m1 + m2);
        let dx2F = (qmi + (m1 * dvi * c)) / (m1 + m2);

        square1.dx = dx1F;
        square2.dx = dx2F;
        collided = true; 
    }
}

function moveObjects() //funzione per il movimento
{
    let coeff = document.getElementById("slider3").value;
    let value = 9.81 * coeff * 0.01684; //a * t
    for (let i = 0; i < arrayObj.length; i++)
    {                
    let ob = arrayObj[i];
    if (ob.x > 3 && ob.x < (canvas.width - arrayObj[i].side - 2)) 
    {
        ob.x += (ob.dx * 1);

        if (ob.dx > 0) //decremento se in presenza di attrito
        {
            if (ob.dx > value)
                ob.dx  -= value;
            else {
                ob.dx = 0;
                chronoStop();
                document.getElementById("chronotime").classList.add('blink');
            }
        }
        else if (ob.dx < 0) //incremento se in presenza di attrito
        {
            if(ob.dx < -value)
                ob.dx += value;
            else {    
                ob.dx = 0;
                chronoStop();
                document.getElementById("chronotime").classList.add('blink');  
            }
        }
                            
    }
    else if(i == 0)
        finished1 = true; 
    else if(i == 1)
        finished2 = true;
    }
    if(finished1 || finished2) {
        chronoStop();
    }
}

function setProperties() //settaggio proprietÃ  oggetti, if(firsTime)
{                      
        if(firstTime) {
        document.getElementById("slider1").disabled = false;
        arrayObj[0].mass = parseInt(document.getElementById("massa1").value);
        arrayObj[1].mass = parseInt(document.getElementById("massa2").value);  
        arrayObj[0].side = Math.round(Math.log(parseInt(document.getElementById("massa1").value) + 8)) * 20;
        arrayObj[0].x = 300 - (arrayObj[0].side / 2);
        arrayObj[0].y = canvas.height - 50 - (arrayObj[0].side);
        arrayObj[1].side = Math.round(Math.log(parseInt(document.getElementById("massa2").value) + 8)) * 20;
        arrayObj[1].x = canvas.width - 400 - (arrayObj[1].side / 2);
        arrayObj[1].y = canvas.height - 50 - (arrayObj[1].side);

        arrayObj[0].dx = parseInt(document.getElementById("vel1").value);       
        arrayObj[1].dx = parseInt(document.getElementById("vel2").value);
        arrayObj[0].dx = arrayObj[0].dx * (document.getElementById("slider1").value / 100);
        arrayObj[1].dx = arrayObj[1].dx * (document.getElementById("slider1").value / 100);     

        v1i = arrayObj[0].dx;
        v2i = arrayObj[1].dx;
        }   
        else
            document.getElementById("slider1").disabled = true;
}  

function drawObjects()
{
    for (let obj in arrayObj)
    {
        arrayObj[obj].draw();      
    }
}


function begin() 
{
    start = !start;
    if(start && firstTime)
        chronoStart();
    else if(start && !firstTime)           
        chronoContinue();
    else
        chronoStop();
    setProperties();
    firstTime = false;
}

function drawSystem() //disegna asse x
{ 
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";

    //asse
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.moveTo(canvas.width, canvas.height - 50);
    ctx.lineTo(canvas.width - 20, canvas.height - 62);
    ctx.moveTo(canvas.width, canvas.height - 50);
    ctx.lineTo(canvas.width - 20, canvas.height - 38);

    //x
    ctx.moveTo(canvas.width - 35, canvas.height - 95);
    ctx.lineTo(canvas.width - 35 + 20, canvas.height - 95 + 20);
    ctx.moveTo(canvas.width - 35, canvas.height - 75);
    ctx.lineTo(canvas.width - 35 + 20, canvas.height - 95);

    ctx.stroke();
    ctx.closePath();
}

function reset_all_stats() //reset parametri di input
{
    document.getElementById("massa1").value = 3.0;
    document.getElementById("vel1").value = 5.0;
    document.getElementById("qm1").innerHTML = 15.0;
    document.getElementById("massa2").value = 9.0;
    document.getElementById("vel2").value = -0;
    document.getElementById("qm2").innerHTML = 0.0;
    document.getElementById("slider1").value = 100;
    document.getElementById("slider1_value").innerHTML = 100;
    document.getElementById("slider2").value = 100;
    document.getElementById("slider2_value").innerHTML = "Totalmente Elastico";
    document.getElementById("slider3").value = 0;
    document.getElementById("slider3_value").innerHTML = 0;
    setProperties();
    if(testob) 
    {
        document.getElementById("TestoProblema").style.visibility = "hidden";
        document.getElementById("soluzione").style.visibility = "hidden";
        document.getElementById("urto").style.visibility = "hidden";
        document.getElementById("verifica").style.visibility = "hidden";
        testob = false;
    }
    generaSoluzione_bool_v2();
    document.getElementById("slider2").disabled = false;
}

function cdmSet() 
{
    if(vec_cdm)
        vec_cdm = false;
    cdm = !cdm;
}

function drawCOM() 
{
    ctx.lineCap = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    m1 = arrayObj[0].mass;
    m2 = arrayObj[1].mass;
    cdx = arrayObj[0].side/2 + arrayObj[0].x + 
    parseInt((m2 * (distance(arrayObj[0], arrayObj[1])-(arrayObj[0].side/2)+(arrayObj[1].side/2))) / (m1+ m2));
    ctx.moveTo(cdx+15, canvas.height - 35);
    ctx.lineTo(cdx-15, canvas.height - 65);
    ctx.moveTo(cdx+15, canvas.height - 65);
    ctx.lineTo(cdx-15, canvas.height - 35);
    ctx.stroke();
    ctx.closePath();
}

function step_bool() 
{
    step = !step;
}

function stepf()
{
    let coeff = document.getElementById("slider3").value;
    let value = 9.81 * coeff * 0.01684; //a * t
    let ob1 = arrayObj[0];
    let ob2 = arrayObj[1];
    let dist = distance(ob1, ob2);
    if(dist < (ob1.side + Math.abs(ob1.dx-ob2.dx))) 
    {
        let angle1 = ob1.angolo();
        let angle2 = ob2.angolo();

        let m1 = ob1.mass;
        let m2 = ob2.mass;

        let v1 = ob1.speed();
        let v2 = ob2.speed();

        let qmi = (m1 * v1 * Math.cos(angle1)) + (m2 * v2 * Math.cos(angle2)); //qm iniziale
        let dvi = Math.abs((v1 * Math.cos(angle1)) - (v2 * Math.cos(angle2))); //val. ass. vel. rel. iniz.
        let c = document.getElementById("slider2").value / 100; //coefficiente di restituzione

        let dx1F = (qmi - (m2 * dvi * c)) / (m1 + m2);
        let dx2F = (qmi + (m1 * dvi * c)) / (m1 + m2);

        ob1.dx = dx1F;
        ob2.dx = dx2F;
    }

    if (ob1.dx > 0) 
    {
        if (ob1.dx > value)
            ob1.dx -= value;
        else {
            ob1.dx = 0;
       }
    }
    else if (ob1.dx < 0) 
    {
        if(ob1.dx < -value)
            ob1.dx += value;
        else {  
            ob1.dx = 0;
        }
    }

    if (ob2.dx > 0)
    {
        if (ob2.dx > value)
            ob2.dx -= value;
        else {
            ob2.dx = 0;
        }
    }
    else if (ob2.dx < 0) 
    {
        if(ob2.dx < -value)
            ob2.dx += value;
        else {    
            ob2.dx = 0;
        }
    }

    ob1.x += ob1.dx;
    ob2.x += ob2.dx;

    step = !step;
    firstTime = false;
}

function back_bool() 
{
    if(document.getElementById("slider3").value != 0)
        alert("Button disabled when there is friction");
    else if(!firstTime && document.getElementById("slider2").value != 0) //solo ad azione iniziata e non per urti anelastici
        back = !back;
    else if(document.getElementById("slider2").value == 0)
        alert("Button disabled for Totally Anelastic collision");
}

function backf()
{
    let ob1 = arrayObj[0];
    let ob2 = arrayObj[1];
    let dist = distance(ob1, ob2);
    if(dist < (ob1.side + Math.abs(ob1.dx-ob2.dx))) 
    {
        let angle1 = ob1.angolo();
        let angle2 = ob2.angolo();

        ob1.dx = v1i;
        ob2.dx = v2i;


    }

    ob1.x -= ob1.dx;
    ob2.x -= ob2.dx;;
    back = !back;
}

function draw() //funzione principale
{
    window.requestAnimationFrame(draw);

    if(clearCanv) clearCanvas();

    if (start && !finished1 && !finished2)
    {
        moveObjects();
        squareCollision();   
    }

    if(step)  {
        setProperties();
        stepf();
    }

    if(back)
        backf();

    drawSystem();
    drawObjects();

    if(cdm && !vec_cdm) 
    {
        setProperties();
        drawCOM();
    }

    if(vec_obj)
    {
        setProperties();
        drawVector_obj();
    }

    if(vec_cdm)
    {
        setProperties();
        drawVector_cdm();
    }

    if(finished1 || finished2)
        document.getElementById("chronotime").classList.add('blink');

    if(soluzione)
        generaSoluzione();
    if(soluzione2)
    	generaSoluzione2();
}


function restart()
{
    arrayObj[0].x = 300 - (arrayObj[0].side / 2);
    arrayObj[0].y = canvas.height - 50 - (arrayObj[0].side);
    arrayObj[1].x = canvas.width - 400 - (arrayObj[1].side / 2);
    arrayObj[1].y = canvas.height - 50 - (arrayObj[1].side);
    arrayObj[0].dx = 1;
    arrayObj[1].dx = -1;
    arrayObj[0].mass = parseInt(document.getElementById("massa1").value);
    arrayObj[1].mass = parseInt(document.getElementById("massa2").value);
    start = false;   
    firstTime = true;
    finished1 = false;
    finished2 = false;
    setProperties();
    chronoReset();
    chronoStop();
    collided = false;
    document.getElementById("chronotime").classList.remove('blink');
}

function distance(a, b)
{
    return Math.abs(a.x - b.x);
}

function qm1_calc() 
{
    num = (document.getElementById("massa1").value*document.getElementById("vel1").value)*100;
    document.getElementById("qm1").style = "color: black";
    document.getElementById("qm1").innerHTML = Math.round(num)/100;
    if(testob) 
    {
        document.getElementById("TestoProblema").style.visibility = "hidden";
        document.getElementById("soluzione").style.visibility = "hidden";
        document.getElementById("urto").style.visibility = "hidden";
        document.getElementById("verifica").style.visibility = "hidden";
        testob = false;
        document.getElementById("slider2").disabled = false;
    }
    generaSoluzione_bool_v2();
}

function qm2_calc() 
{
    num = (document.getElementById("massa2").value*document.getElementById("vel2").value)*100;
    document.getElementById("qm2").style = "color: black";
    document.getElementById("qm2").innerHTML = Math.round(num)/100;
    if(testob)
    {
        document.getElementById("TestoProblema").style.visibility = "hidden";
        document.getElementById("soluzione").style.visibility = "hidden";
        document.getElementById("urto").style.visibility = "hidden";
        document.getElementById("verifica").style.visibility = "hidden";
        testob = false;
        document.getElementById("slider2").disabled = false;
    }
    generaSoluzione_bool_v2();
}

function nascondiTesto2()
{
	if(testob2) 
    {
        document.getElementById("TestoProblema2").style.visibility = "hidden";
        document.getElementById("soluzione2").style.visibility = "hidden";
        document.getElementById("urto2").style.visibility = "hidden";
        testob2 = false; 
    }
    generaSoluzione2_bool_v2();
    document.getElementById("hide2").style.display = "none";
}

function vector_obj()
{
    vec_obj = !vec_obj;
}

function drawVector_obj()
{
    let img_dx = document.getElementById("arrow_dx");
    let img_sx = document.getElementById("arrow_sx");

    var obj1 = arrayObj[0];
    var obj2 = arrayObj[1];
    let x1 = obj1.x;
    let y1 = obj1.y;
    let x2 = obj2.x;
    let y2 = obj2.y;

    //Blocco 1
    let length1 = Math.ceil(Math.log(Math.abs(parseInt(obj1.dx / (document.getElementById("slider1").value / 100)))+1) * 50);
    if(obj1.dx != 0)
        length1 += 15;
    if(obj1.dx >= 0)
    {
        ctx.drawImage(img_dx, x1+obj1.side/2-5, y1+obj1.side/2-56, length1 * 2, 115);
    }
    else if(obj1.dx < 0){
        ctx.drawImage(img_sx, x1+obj1.side/2-5, y1+obj1.side/2-56, -length1 * 2, 115);
    }    
        
    //Blocco 2
    let length2 = Math.ceil(Math.log(Math.abs(parseInt(obj2.dx / (document.getElementById("slider1").value / 100)))+1) * 50);
    if (obj2.dx < 0)
    {
        ctx.drawImage(img_sx, x2+obj2.side/2-5, y2+obj2.side/2-56, -length2 * 2, 115);
    }
    else if (obj2.dx > 0){
        ctx.drawImage(img_dx, x2+obj2.side/2-5, y2+obj2.side/2-56, length2 * 2, 115);
    }
}

function vector_cdm()
{
    if(cdm)
        cdm = false;
    vec_cdm = !vec_cdm;
}

function drawVector_cdm()
{
    let m1 = arrayObj[0].mass;
    let m2 = arrayObj[1].mass;
    let imgcdm_sx = document.getElementById("arrowcdm_sx");
    let imgcdm_dx = document.getElementById("arrowcdm_dx");
    let cdm_x = arrayObj[0].side/2 + arrayObj[0].x + 
    parseInt((m2 * (distance(arrayObj[0], arrayObj[1])-(arrayObj[0].side/2)+(arrayObj[1].side/2))) / (m1+ m2));

    let v1 = arrayObj[0].dx;
    let v2 = arrayObj[1].dx;

    let vcdm = ((m1 * v1) + (m2 * v2)) / (m1 + m2);

    let length = Math.ceil(Math.log(Math.abs(vcdm  / (document.getElementById("slider1").value / 100))+1) * 50);
    if(vcdm >= 0)
    {
        ctx.drawImage(imgcdm_dx, cdm_x - 11, 218, length * 2, 65);
    }
    else
    {
        ctx.drawImage(imgcdm_sx, cdm_x - 11, 218, -length * 2, 65);
    
    }
}

function chrono()
{
    end = new Date();
    diff = end - starta;
    diff = new Date(diff);
    var msec = diff.getMilliseconds();
    var sec = diff.getSeconds();
    var min = diff.getMinutes();
    var hr = diff.getHours()-1;

    if (min < 10)
        min = "0" + min;
    if (sec < 10)
        sec = "0" + sec;
    if(msec < 10)
        msec = "00" +msec;
    else if(msec < 100)
        msec = "0" +msec;

    document.getElementById("chronotime").innerHTML = min + ":" + sec + ":" + Math.round(msec / 100);
    timerID = setTimeout("chrono()", 10);
}

function chronoStart()
{
    if(!step) {
    starta = new Date();
    chrono();
}
}

function chronoContinue()
{
    starta = new Date()-diff
    starta = new Date(starta)
    chrono()
}

function chronoReset()
{
    document.getElementById("chronotime").innerHTML = "00:00:0"
    starta = new Date()
}

function chronoStopReset()
{
    document.getElementById("chronotime").innerHTML = "00:00:0"
    document.chronoForm.startstop.onclick = chronoStart
}

function chronoStop()
{
    clearTimeout(timerID)
}

var testo_sol;

function generaTesto2()
{
	document.getElementById("hide2").style.display = "inline";
	
    var vel1 = Math.round(Math.random() * 31);

    var massa2 = Math.round(Math.random() * 101);

    var vel2 = Math.round(Math.random() * -31);

    var massa1 = Math.round(Math.random() * 101);    

    testo_sol = "Block's mass is : ";
    testo_sol += massa1;
    testo_sol += " kg ";

    let qmi = (massa1 * vel1) + (massa2 * vel2); //qm iniziale
    let dvi = Math.abs((vel1) - (vel2)); //val. ass. vel. rel. iniz.

    generaSoluzione2_bool_v2();

    let velf1;
    let velf2;
    restart();

    var testo2 = "";

    c = 100 * Math.round((Math.random() * 101) / 100);

    velf1 = Math.round(((qmi - (massa2 * dvi * c / 100)) / (massa1 + massa2)) * 100) / 100;
    velf2 = Math.round(((qmi + (massa1 * dvi * c / 100)) / (massa1 + massa2)) * 100) / 100;  

    setProperties();
    testo2 = "that has a speed of <i>'";
    testo2 += vel1;
    testo2 += "' m/s </i> and collides with a block which mass is <i>'";
    testo2 += massa2;
    testo2 += "' kg </i> and speed is <i>'";
    testo2 += vel2;
    testo2 += "' m/s. The velocities after collision are: </i>";
    testo2 += velf1;
    testo2 += "' m/s </i> and <i> '";
    testo2 += velf2;
    testo2 += "' m/s </i>."
    if(c == 100)
    {
        document.getElementById("urto2").innerHTML = "Totally Elastic Collision!";
    }
    else if(c == 0){
        document.getElementById("urto2").innerHTML = "Totally Anelastic Collision!";
    }
    document.getElementById("TestoProblema2").innerHTML = testo2;
    document.getElementById("TestoProblema2").style.visibility = "visible";
    document.getElementById("urto2").style.visibility = "visible";
    testob2 = true;	
}

function generaSoluzione2()
{
    document.getElementById("soluzione2").innerHTML = testo_sol;
    if(soluzione2) document.getElementById("soluzione2").style.visibility = "visible";
}

function generaSoluzione2_bool()
{
    if(testob2){
    if(soluzione2)
    {
        document.getElementById("soluzione2").innerHTML = "";
        document.getElementById("soluzione2").style.visibility = "hidden";
    }
    soluzione2 = !soluzione2;
}
}

function generaTesto() //Funzione per generare il testo
{
    document.getElementById("slider2").disabled = true;
    generaSoluzione_bool_v2();
    if(!testob)
        alert("To exit the problem, modify an input parameter, except for 'event speed'")
    restart();
    var massa1 = Math.round(Math.random() * 101);
    document.getElementById("massa1").value =  massa1 ;

    var vel1 = Math.round(Math.random() * 31);
    document.getElementById("vel1").value = vel1;

    var massa2 = Math.round(Math.random() * 101);
    document.getElementById("massa2").value = massa2;

    var vel2 = Math.round(Math.random() * -31);
    document.getElementById("vel2").value = vel2;
    var testo = "";
    setProperties();
    testo = "between a block of mass <i>'";
    testo += massa1;
    testo += "' kg </i> and speed <i>'";
    testo += vel1;
    testo += "' m/s </i> and a second block with a mass of <i>'";
    testo += massa2;
    testo += "' kg </i> and a speed  <i>'";
    testo += vel2;
    testo += "' m/s </i>.";
    var c = 100 * Math.round((Math.random() * 101) / 100);
    document.getElementById("slider2").value = c;
    if(c == 100)
    {
        document.getElementById("slider2_value").innerHTML = "Totally Elastic";
        document.getElementById("urto").innerHTML = "Totally Elastic Collision!";
    }
    else if(c == 0){
        document.getElementById("slider2_value").innerHTML = "Totally Inelastic";
        document.getElementById("urto").innerHTML = "Totally Inelastic Collision!";
    }
    document.getElementById("TestoProblema").innerHTML = testo;
    document.getElementById("TestoProblema").style.visibility = "visible";
    document.getElementById("urto").style.visibility = "visible";
    testob = false;
    qm1_calc();
    qm2_calc();
    testob = true;
}

function generaSoluzione2_bool_v2()
{
    soluzione2 = false;
    document.getElementById("soluzione2").innerHTML = "";
    document.getElementById("soluzione2").style.visibility = "hidden";
}



function generaSoluzione_bool()
{
    if(testob){
    if(soluzione)
    {
        document.getElementById("soluzione").innerHTML = "";
        document.getElementById("soluzione").style.visibility = "hidden";
        document.getElementById("verifica").style.visibility = "hidden";
    }
    soluzione = !soluzione;
}
}

function generaSoluzione_bool_v2()
{
    soluzione = false;
    document.getElementById("soluzione").innerHTML = "";
    document.getElementById("soluzione").style.visibility = "hidden";
    document.getElementById("verifica").style.visibility = "hidden";
}

function generaSoluzione(){


    let square1 = arrayObj[0];
    let square2 = arrayObj[1];

    let angle1 = square1.angolo();
    let angle2 = square2.angolo();

    let m1 = square1.mass;
    let m2 = square2.mass;

    let v1 = square1.speed();
    let v2 = square2.speed();

    let qmi = (m1 * v1 * Math.cos(angle1)) + (m2 * v2 * Math.cos(angle2)); //qm iniziale
    let dvi = Math.abs((v1 * Math.cos(angle1)) - (v2 * Math.cos(angle2))); //val. ass. vel. rel. iniz.
    let c = document.getElementById("slider2").value / 100; //coefficiente di restituzione

    let velf1 = Math.round(((qmi - (m2 * dvi * c)) / (m1 + m2)) * 100) / 100;
    let velf2 = Math.round(((qmi + (m1 * dvi * c)) / (m1 + m2)) * 100) / 100;

    testo = "The final speeds are ";
    testo += velf1;
    testo += " m/s and ";
    testo += velf2;
    testo += " m/s";
    document.getElementById("soluzione").innerHTML = testo;
    document.getElementById("soluzione").style.visibility = "visible";
    document.getElementById("verifica").style.visibility = "visible";
}































