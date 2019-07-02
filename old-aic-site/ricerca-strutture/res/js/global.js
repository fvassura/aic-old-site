<!--
function getParameter(name){
    //Carico i parametri
    var params = getRequestParameter();
    //Leggo il parametro 'name'
    return params[name];
}

function getRequestParameter(){
    //Array Associativo che conterrà i parametri presenti in querystring
            // ****** ESEMPIO DI UTILIZZO ***********/
            //Carico i parametri
            //var params = getRequestParameter();
            //Leggo il parametro 'nome'
            //var parametro = params[nome];

    var allParams = new Array();

    //Recupero la URL visualizzata
    var url = unescape( String(this.location) );

    //Restituisco NULL se non ci sono i parametri
    if(url.indexOf('?') < 0)
    return null;

    //Recupero la lista dei parametri/valori
    var paramList = url.split("?")[1];

    //Recupero ogni coppia chiave/valore
    var params = paramList.split("&");

    //Scorro tutte le coppie chiave/valore e le separo
    for(var i=0; i<params.length; i++){
        var temp = params[i].split("=");

        //Carico l'array con tutti i parametri trovati
        allParams[temp[0]] = temp[1];
    }

    //Restituisco l'array dei parametri con i rispettivi valori
    return allParams;
}





function Conferma(msg) 
        {
           if (confirm(msg)) 
              return true
           else 
              return false;
        }
function ricaricaHome()
{
top.location.href="http://www.celiachia.it";
}
function ricaricaPagina(pag)
{
top.location.href=pag;
}
function neo_carica_regioni(drop) {
	var web = drop.value; //document.frmPagina.neo.value;
    //alert("Sarai rediretto al sito " + web);
	web = "http://" + web;
        window.open(web, "","fullscreen=no,menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes");
}
function carica() {
        window.location = "?id=" + document.frmPagina.elenco.value + "#aReg";
}

function carica2() {
        window.location = "?prov=" + document.frmPagina.elenco2.value + "#aReg";
}  

function goForum(){
var w, s;
try
{
    s="http://it.groups.yahoo.com/group/celiachia/";
    //s="http://www.celiachia.it/forum/mailforum.asp";	
	w=window.open(s,'celiachia_forum','fullscreen=no,menubar=yes,resizable=yes,toolbar=yes,location=no,status=no,scrollbars=yes');
	w.focus();
}catch(e){
	window.open(s);
}
}

function cercaNelSito(ff){
var w;
var parola;
parola=ff.txtRicerca.value
try
{
	w=window.open("http://www.google.it/search?q=" + parola + "&btnG=Cerca&hl=it&sitesearch=www.celiachia.it",'celiachia_google','fullscreen=no,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes');
	//window.open("http://www.google.it/search?q=" + parola + "&btnG=Cerca&hl=it&sitesearch=www.celiachia.it",'','');
	w.focus();
	}catch(e)
	{
	window.open("http://www.google.it/search?q=" + parola + "&btnG=Cerca&hl=it&sitesearch=www.celiachia.it");
	}
	
}
function printPage() { print(); }





function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_nbGroup(event, grpName) { //v6.0
  var i,img,nbArr,args=MM_nbGroup.arguments;
  if (event == "init" && args.length > 2) {
    if ((img = MM_findObj(args[2])) != null && !img.MM_init) {
      img.MM_init = true; img.MM_up = args[3]; img.MM_dn = img.src;
      if ((nbArr = document[grpName]) == null) nbArr = document[grpName] = new Array();
      nbArr[nbArr.length] = img;
      for (i=4; i < args.length-1; i+=2) if ((img = MM_findObj(args[i])) != null) {
        if (!img.MM_up) img.MM_up = img.src;
        img.src = img.MM_dn = args[i+1];
        nbArr[nbArr.length] = img;
    } }
  } else if (event == "over") {
    document.MM_nbOver = nbArr = new Array();
    for (i=1; i < args.length-1; i+=3) if ((img = MM_findObj(args[i])) != null) {
      if (!img.MM_up) img.MM_up = img.src;
      img.src = (img.MM_dn && args[i+2]) ? args[i+2] : ((args[i+1])? args[i+1] : img.MM_up);
      nbArr[nbArr.length] = img;
    }
  } else if (event == "out" ) {
    for (i=0; i < document.MM_nbOver.length; i++) {
      img = document.MM_nbOver[i]; img.src = (img.MM_dn) ? img.MM_dn : img.MM_up; }
  } else if (event == "down") {
    nbArr = document[grpName];
    if (nbArr)
      for (i=0; i < nbArr.length; i++) { img=nbArr[i]; img.src = img.MM_up; img.MM_dn = 0; }
    document[grpName] = nbArr = new Array();
    for (i=2; i < args.length-1; i+=2) if ((img = MM_findObj(args[i])) != null) {
      if (!img.MM_up) img.MM_up = img.src;
      img.src = img.MM_dn = (args[i+1])? args[i+1] : img.MM_up;
      nbArr[nbArr.length] = img;
  } }
}
//-->