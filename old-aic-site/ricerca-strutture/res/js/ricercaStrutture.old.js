/*
 * 
 * Alessandra Dotnext 30-01-2015
 * 
 * Tutto questo non dovrebe servire più
 */

if(typeof(dataMinimaModificheStruttura) == 'undefined'){
	dataMinimaModificheStruttura = new Date(new Date().getFullYear()-1, 0, 1);
}

$('#dataInizio').datepicker({
	changeMonth: true,
	changeYear: true,
	numberOfMonths: 3,
	minDate: dataMinimaModificheStruttura,
	maxDate: new Date(),
	showButtonPanel: true
});

$('#dataFine').datepicker({
	changeMonth: true,
	changeYear: true,
	numberOfMonths: 3,
	minDate: dataMinimaModificheStruttura,
	maxDate: new Date(),
	showButtonPanel: true
});

var myStrutture =
{
    creaFormRicercaStrutture:function()
    {
        $.ajax(
        {
             url:"http://www.afcaic.it/webservices/creaFormRicercaStrutture.php",
             dataType: 'jsonp',
             success:function(json)
             {
                $('#formRicercaStrutture').html(json);
//                $('#filtraCategorie').change(function(){
//                    var idCategoria = $('#filtraCategorie').val();
//                    myStrutture.aggiornaTipologie(idCategoria);
//                });
//                $('#cercaRisultati').click(function(){
//                    myStrutture.ricercaStrutture();
//                });
//
//
//                $('#filtraRegioniItalia').change(function(){
//                    var idRegioneItalia = $('#filtraRegioniItalia').val();
//                    myStrutture.aggiornaProvince(idRegioneItalia);
//                });
//
//                $('#cercaNomeCitta').keydown(function(){
//                    myStrutture.completaCitta('#cercaNomeCitta');
//                });
//
//                $('#dataInizio').datepicker({
//                    changeMonth: true,
//                    changeYear: true,
//                    numberOfMonths: 3,
//                    minDate: new Date(new Date().getFullYear()-1, 0, 1),
//                    maxDate: new Date(),
//                    showButtonPanel: true
//                });
//
//                $('#dataFine').datepicker({
//                    changeMonth: true,
//                    changeYear: true,
//                    numberOfMonths: 3,
//                    minDate: new Date(new Date().getFullYear()-1, 0, 1),
//                    maxDate: new Date(),
//                    showButtonPanel: true
//                });
//
//
//                $('#esportaRisultati').click(function(){
//                    myStrutture.esportaStrutture();
//                });
//
//                $('#denominazioneStruttura').keydown(function(){
//                    myStrutture.completaDenominazione('#denominazioneStruttura');
//                });
             },
             error:function(){
                 alert("Error");
             }
        });
    }
//    ,
//	ricercaStrutture:function()
//	{
//		var categoriaSelezionata = $('#filtraCategorie').val();
//
//		var tipologiaSelezionata = $('#filtraTipologie').val();
//
//		var regioneSelezionata = $('#filtraRegioniItalia').val();
//
//		var provinciaSelezionata = $('#filtraProvince').val();
//
//		var cittaSelezionata = $('#cercaNomeCitta').val();
//
//		var denominazioneStruttura = $('#denominazioneStruttura').val();
//
//		$.ajax(
//		{
//		    url: 'http://www.afcaic.it/webservices/common/faiCercaStrutture.php',
//		    dataType: 'jsonp',
//			data:
//			{
//					'idCategoria':		categoriaSelezionata,
//					'idTipologia':      tipologiaSelezionata,
//					'idRegioneItalia':	regioneSelezionata,
//					'idProvincia':		provinciaSelezionata,
//					'nomeCitta':        cittaSelezionata,
//					'denominazioneStruttura': denominazioneStruttura
//			},
//			success:function(strutture)
//            {
//                $('#dettaglioStruttura').html('');
//                struttureDecoded = $.parseJSON(strutture);
//                var results = myStrutture.creaTabellaStrutture(struttureDecoded);
//                $('#risultatiRicercaStrutture').html(results);
//
//                //var oTable = $('#tableStrutture').dataTable({
//                $('#tableStrutture').dataTable(
//                {
//                    "fnStateSaveParams": function(oSettings, json)
//                    {
//                        $('.openDettagli').click(function(e)
//                        {
//                            e.preventDefault();
//                            var idStruttura = $.trim($(this).parent().siblings('.idStruttura').text());
//                            myStrutture.mostraDettagli(idStruttura);
//                        });
//                    },
//                    /*"aoColumns": [
//                        { "sWidth": "10%" },
//                        { "sWidth": "10%" },
//                        { "sWidth": "10%" },
//                        { "sWidth": "20%" },
//                        //{ "sWidth": "75%" },
//                        { "sWidth": "20%" },
//                        { "sWidth": "10%" },
//                        { "sWidth": "20%" },
//                        { "sWidth": "20%" },
//                        { "sWidth": "20%" }
//                    ],*/
//                    "sScrollX": "100%",
//                    "sScrollXInner": "150%",
//                    "bScrollCollapse": true,
//                    "bSortClasses": false,
//                    "sPaginationType": "full_numbers",
//                    "bStateSave": true,
//                    //"bAutoWidth": true,
//                    "bDestroy": true,
//                    "bDeferRender": true,
//                    "sDom": 'T<"clear">lfrtip',
//                    "oTableTools":
//                    {
//                        "sSwfPath": "/res/TableTools2.1.5/swf/copy_csv_xls_pdf.swf",
//                        "aButtons":
//                        [
//                            {
//                                "sExtends": "pdf",
//                                "sButtonText": "Salva PDF",
//                                "mColumns": [1, 2, 3, 4, 5, 6, 7, 8],
//                                "sFileName": "AFC - strutture.pdf",
//                                "sTitle": "Associazione Italiana Celiachia"
//                            }
//                        ]
//                    },
//                    "oLanguage":
//                    {
//                        "sLengthMenu": "Mostra _MENU_ risultati per pagina",
//                        "sZeroRecords": "Nessun elemento trovato",
//                        "sInfo": "Mostra da _START_ a _END_ di _TOTAL_ risultati",
//                        "sInfoEmpty": "Mostra 0 su 0 di 0 risultati",
//                        "sInfoFiltered": "(Filtrati da _MAX_ risultati totali)",
//                        "sSearch": "Filtra:",
//                        "oPaginate":
//                        {
//                            "sFirst": "|<",
//                            "sLast": ">|",
//                            "sNext": ">",
//                            "sPrevious": "<"
//                        }
//                    }
//                });
//            }
//        });
//	},
//	aggiornaProvince:function(idRegioneItalia)
//	{
//        $.ajax(
//        {
//             url: "http://www.afcaic.it/webservices/common/aggiornaProvince.php",
//             dataType: 'jsonp',
//             data:
//             {
//                'idRegioneItalia': idRegioneItalia
//             },
//             success:function(json)
//             {
//                $('#filtraProvince').html(json);
//             },
//             error:function(){
//                 alert("Error");
//             }
//        });
//
//	},
//	creaTabellaStrutture:function(strutture)
//	{
//		var tabella =
//		"<div id='tableStruttureContainer'>"+
//			"<table id='tableStrutture' width='100%' cellspacing='0' class='elenco'>\n"+
//				"<thead>\n"+
//					"<tr class='tab_intestazione'>\n"+
//					    "<th class='hidden_field '>Id Struttura</th>\n"+
//					    "<th>Categoria</th>\n"+
//                        "<th>Regione</th>\n"+
//                        "<th>Provincia</th>\n"+
//						"<th>Citt&agrave;</th>\n"+
//						"<th>Tipologia</th>\n"+
//						"<th>Nome esercizio</th>\n"+
//                        "<th>Indirizzo</th>\n"+
//						"<th>Telefono</th>\n"+
//						//Mettere indirizzo
//						"<th>Mappa</th>\n"+
//					"</tr>\n"+
//				"</thead>\n"+
//			    "<tbody>\n";
//
//		for(var i = 0; i < strutture.length; i++)
//		{
//		    if(i%2 === 0) { tabella += "<tr class='AltRowStyle row'>\n"; }
//			else { tabella += "<tr class='RowStyle row'>\n"; }
//			tabella +=
//			    "<td class='hidden_field idStruttura'>\n"+
//					strutture[i].ID+"\n"+
//				"</td>\n"+
//			    "<td>\n"+
//					strutture[i].Categoria+"\n"+
//				"</td>\n"+
//                "<td>\n"+
//					"<a class='openDettagli' href='#'>"+strutture[i].NomeRegioneItalia+"</a>\n"+
//				"</td>"+
//                "<td>\n"+
//					"<a class='openDettagli' href='#'>"+strutture[i].NomeProvincia+"</a>\n"+
//				"</td>"+
//				"<td>\n"+
//					"<a class='openDettagli' href='#'>"+strutture[i].NomeLocalita+"</a>\n"+
//				"</td>\n"+
//				"<td>\n"+
//					"<a class='openDettagli' href='#'>"+strutture[i].Tipologie+"</a>\n"+
//				"</td>\n"+
//				"<td>\n"+
//					"<a class='openDettagli' href='#'>"+strutture[i].Denominazione+"</a>\n"+
//				"</td>"+
//                "<td>\n"+
//					"<a class='openDettagli' href='#'>"+strutture[i].Indirizzo+"</a>\n"+
//				"</td>"+
//				"<td>\n"+
//					"<a class='openDettagli' href='#'>"+strutture[i].Telefono+"</a>\n"+
//				"</td>"+
//				"<td>"+
//					"<a target='_blank' href='http://maps.google.it/maps?hl=it&amp;q="+strutture[i].Coordinate+"'>Mappa</a>"+
//				"</td>"+
//			"</tr>";
//		}
//		tabella += "</tbody><tfoot></tfoot>\n</table>\n</div>";
//		return tabella;
//	},
//	mostraDettagli:function(idStruttura)
//	{
//	    myStrutture.cercaDettaglioStruttura(idStruttura);
//	},
//	creaTabellaDettaglioStruttura:function(datiStruttura)
//	{
//	    var htmlDettaglioStruttura =
//	        "<div id='ctl00_cphContenutoPagina_lblLocale'>"+
//                "<h2>"+datiStruttura.Denominazione+"</h2>"+
//                "<strong>Regione: </strong>"+
//                datiStruttura.NomeRegioneItalia+
//                "<br/>"+
//                "<strong>Provincia: </strong>"+
//                datiStruttura.NomeProvincia+
//                "<br/>"+
//                "<strong>Citta: </strong>"+
//                datiStruttura.NomeLocalita+
//                "<br/>"+
//                "<strong>Indirizzo: </strong>"+
//                datiStruttura.Indirizzo+
//                "<br/>"+
//                "<strong>Tel/Fax: </strong>"+datiStruttura.Telefono+
//                "<br/>";
//        if(datiStruttura.ReferenteSG !== null)
//        {
//            htmlDettaglioStruttura +=
//            "<strong>Persona/e di riferimento: </strong>"+
//            datiStruttura.ReferenteSG+
//            "<br/>";
//        }
//        htmlDettaglioStruttura +=
//                "<strong>Note: </strong>"+
//                datiStruttura.Note+
//                "<br/>";
//        if(datiStruttura.CostoMedioPasto > 0)
//        {
//            htmlDettaglioStruttura += "<strong>Prezzo min/max: </strong>"+datiStruttura.CostoMedioPasto+"<br/>";
//        }
//        if(datiStruttura.IndirizzoWeb !== null && datiStruttura.IndirizzoWeb.length > 1)
//        {
//            htmlDettaglioStruttura +=
//            "<strong>Sito web: </strong> "+
//            "<a target='_blank' href='http://"+datiStruttura.IndirizzoWeb+"'>"+datiStruttura.IndirizzoWeb+"</a>"+"<br/>";
//        }
//        if(datiStruttura.PeriodoChiusura !== null && datiStruttura.PeriodoChiusura.length > 1)
//        {
//            htmlDettaglioStruttura +=
//            "<strong>Chiusura: </strong> "+datiStruttura.PeriodoChiusura+"<br/>";
//        }
//        if(datiStruttura.ElencoNomiFileLogoCollaborazioni !== null && datiStruttura.ElencoNomiCollaborazioni !== null)
//        {
//            htmlDettaglioStruttura +=
//            "<strong>Collaborazioni: </strong>";
//
//            var arrIcons = datiStruttura.ElencoNomiFileLogoCollaborazioni.split(',');
//            var altImages = datiStruttura.ElencoNomiCollaborazioni.split(',');
//
//            for(var i = 0; i < arrIcons.length; i++)
//            {
//                htmlDettaglioStruttura += "<img alt='"+altImages[i]+"' src='/public/AFC/COLLABORAZIONI/LOGHI/"+arrIcons[i]+"'></img> ";
//            }
//            htmlDettaglioStruttura +="<br/>";
//        }
//        htmlDettaglioStruttura += "</div>";
//        return htmlDettaglioStruttura;
//	},
//	cercaDettaglioStruttura:function(idStruttura)
//	{
//        $.ajax(
//        {
//             url: 'http://www.afcaic.it/webservices/common/cercaDettaglioStruttura.php',
//             dataType: 'jsonp',
//             data:
//             {
//                'idStruttura': idStruttura
//             },
//             success:function(json)
//             {
//                var dataDecoded = $.parseJSON(json);
//                var results = myStrutture.creaTabellaDettaglioStruttura(dataDecoded);
//                $('#dettaglioStruttura').html(results);
//             },
//             error:function(){
//                 alert("Error");
//             }
//        });
//	},
,
	esportaStrutture:function()
	{

	    var url = 'http://www.afcaic.it/public/esportaStruttureModificate';

	    var categoriaSelezionata = ($('#filtraCategorie').val() == '-1') ? '*' : $('#filtraCategorie').val();

		//var tipologiaSelezionata = ($('#filtraTipologie').val() == '-1') ? '*' : $('#filtraTipologie').val();

		var regioneSelezionata = ($('#filtraRegioniItalia').val() == '-1') ? '*' : $('#filtraRegioniItalia').val();

		//var provinciaSelezionata = ($('#filtraProvince').val() == '-1') ? '*' : $('#filtraProvince').val();

		var dataInizio = ($('#dataInizio').val() == '') ? '*' : $('#dataInizio').val();
		var dataFine = ($('#dataFine').val() == '') ? '*' : $('#dataFine').val();

		//console.log(dataInizio);

	    //if(regioneSelezionata !== '*'){ url += '/'+regioneSelezionata; }

	    url += '/'+regioneSelezionata;
	    var dataInizioTimestamp = null;
		var dataFineTimestamp = null;

	    if(dataInizio !== '*')
	    {
	        dataInizioTimestamp = myStrutture.textDateToDatetimeFormat(dataInizio, '/');
	        url += '/'+dataInizioTimestamp;
	    }
	    else { url += '/'+dataInizio; }

	    if(dataFine !== '*')
	    {
	        dataFineTimestamp = myStrutture.textDateToDatetimeFormat(dataFine, '/');
	        url += '/'+dataFineTimestamp;
	    }
	    else { url += '/'+dataFine; }

	    url += '/'+categoriaSelezionata;

		var checkedStatiStruttura = $("input[name='statoStruttura']:checked");

		var stati = Array();
		if(checkedStatiStruttura !== undefined && checkedStatiStruttura.length > 0)
		{
		    checkedStatiStruttura.each(function(){
		        stati.push($(this).val());
		    });
		    if($.inArray('nuove', stati) > -1)
		    {
		        url += '/true';
		    }
		    else { url += '/false'; }

		    if($.inArray('modificate', stati) > -1)
		    {
		        url += '/true';
		    }
		    else { url += '/false'; }

		    if($.inArray('eliminate', stati) > -1)
		    {
		        url += '/true';
		    }
		    else { url += '/false'; }

		    $('#checkboxStatoStruttura').removeClass('border_red');
		    window.location.href = url;
		}
		else
		{
		    $('#checkboxStatoStruttura').addClass('border_red');
		    return false;
		}
	},
	textDateToDatetimeFormat:function(textDate, delimiter)
	{
	    var regex = /[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/;
	    var isMatched = textDate.match(regex);
	    if(isMatched === null) { return null; }
	    var tmp = textDate.split('/');
	    var newDateTime = tmp[2]+'-'+tmp[1]+'-'+tmp[0];
	    return newDateTime;
	},
//	aggiornaTipologie:function(idCategoria)
//	{
//        $.ajax(
//        {
//             url: "http://www.afcaic.it/webservices/common/aggiornaTipologie.php",
//             dataType: 'jsonp',
//             data:
//             {
//                'idCategoria': idCategoria
//             },
//             success:function(json)
//             {
//                $('#filtraTipologie').html(json);
//             },
//             error:function(){
//                 alert("Error");
//             }
//        });
//	},
//    completaCitta:function(idInput)
//	{
//        var url = 'http://www.afcaic.it/webservices/common/autocompletaCitta.php';
//        $(idInput).autocomplete(
//        {
//            source: function( request, response )
//            {
//                $.ajax(
//                {
//                    url: $.trim(url),
//                    dataType: "jsonp",
//                    data:
//                    {
//                        term: request.term
//                    },
//                    success: function( data )
//                    {
//                        var decodedData = $.parseJSON(data);
//
//                        response( $.map(decodedData,
//                                        function( item )
//                                        {
//                                            var returnValue =
//                                            {
//                                                label: item.label,
//                                                value: item.value
//                                            };
//                                            return returnValue;
//                                        }));
//                    }
//                });
//            },
//            minLength: 2
//        });
//	},
//	completaDenominazione:function(idInput)
//	{
//        var url = 'http://www.afcaic.it/webservices/common/autocompletaDenominazioneStruttura.php';
//
//        $(idInput).autocomplete(
//        {
//            source: function( request, response )
//            {
//                $.ajax(
//                {
//                    url: $.trim(url),
//                    dataType: "jsonp",
//                    data:
//                    {
//                        term: request.term
//                    },
//                    success: function( data )
//                    {
//                        var decodedData = $.parseJSON(data);
//
//                        response( $.map(decodedData,
//                                        function( item )
//                                        {
//                                            var returnValue =
//                                            {
//                                                label: item.label,
//                                                value: item.value
//                                            };
//                                            return returnValue;
//                                        }));
//                    }
//                });
//            },
//            minLength: 2
//        });
//	}
};
