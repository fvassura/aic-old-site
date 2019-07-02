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
             url:"https://www.afcaic.it/webservices/creaFormRicercaStrutture.php",
             dataType: 'jsonp',
             success:function(json)
             {
                $('#formRicercaStrutture').html(json);
             },
             error:function(){
                 alert("Error");
             }
        });
    }
,
	esportaStrutture:function()
	{

	    var url = 'https://www.afcaic.it/public/esportaStruttureModificate';

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
};
