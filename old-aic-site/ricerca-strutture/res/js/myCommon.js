/*
 * 
 * Alessandra Dotnext 30-01-2015
 * 
 * Tutto questo non dovrebe servire più
 */

$(document).ready(function () {

    //    $('#dataInizio').datepicker({
    //        changeMonth: true,
    //        changeYear: true,
    //        numberOfMonths: 3,
    //        minDate: new Date(new Date().getFullYear()-1, 0, 1),
    //        maxDate: new Date(),
    //        showButtonPanel: true
    //    });
    //    
    //    $('#dataFine').datepicker({
    //        changeMonth: true,
    //        changeYear: true,
    //        numberOfMonths: 3,
    //        minDate: new Date(new Date().getFullYear()-1, 0, 1),
    //        maxDate: new Date(),
    //        showButtonPanel: true
    //    });
    //
    //    $('#checkboxStatoStruttura').children('input').each(function(){
    //        $(this).attr('checked', true);
    //    });

    //var url = window.location.href;
    //myStrutture.creaFormRicercaStrutture();

    /*
		
        var data = [
            {
                "ID": 5151,
                "IdCategoria": 3,
                "CategoriaGuida": "Accommodations",
                "IconaCategoriaGuida": "DOVE DORMIRE.jpg",
                "IdRegioneItalia": 2,
                "NomeRegioneItalia": "Abruzzo",
                "IdProvincia": 23,
                "NomeProvincia": "Chieti",
                "IdLocalita": 2405,
                "NomeLocalita": "Casoli",
                "Tipologie": "B&B",
                "TipoEsteso": "Bed & Breakfast ",
                "Denominazione": "Biocasa Quarto a Monte",
                "Indirizzo": "Via Roma 12",
                "Telefono": "347.6071674",
                "Latitudine": "42.1183886",
                "Longitudine": "14.2927180"
            },
            {
                "ID": 2446,
                "IdCategoria": 12,
                "CategoriaGuida": "Accommodations",
                "IconaCategoriaGuida": "DOVE DORMIRE.jpg",
                "IdRegioneItalia": 2,
                "NomeRegioneItalia": "Abruzzo",
                "IdProvincia": 23,
                "NomeProvincia": "Chieti",
                "IdLocalita": 1374,
                "NomeLocalita": "Fara Filiorum Petri",
                "Tipologie": "H, R, B&B",
                "TipoEsteso": "Hotel Restaurant Bed & Breakfast ",
                "Denominazione": "S. Eufemia",
                "Indirizzo": "Via S. Eufemia, 125",
                "Telefono": "0871.70154",
                "Latitudine": "42.2325983",
                "Longitudine": "14.1763610"
            }
        ];
    
        $('#example').DataTable({
            ajax: {
                url: data,
                dataSrc: ''
            },
            columns: [
                { data: 'ID' },
                { data: 'CategoriaGuida' },
                { data: 'Denominazione' },
                { data: 'Latitudine' }
            ]
        });*/

	$("button#load-full").click(LoadFullStrutture);
	
	function LoadFullStrutture() {
		//show loading
		$("div.wrap-loader").show();
		$("div#page").hide();


		$.getJSON("../AppData/fullStutture.json")
			.done(function (data) {
				//creo la tabella dal json
				$.each(data, function (index, struttura) {

					var tableRow = `<tr><td>${struttura.ID}</td><td>${struttura.IdCategoria}</td><td>${struttura.CategoriaGuida}</td><td>${struttura.IconaCategoriaGuida}</td><td>${struttura.IdRegioneItalia}</td><td>${struttura.NomeRegioneItalia}</td><td>${struttura.IdProvincia}</td><td>${struttura.NomeProvincia}</td><td>${struttura.IdLocalita}</td><td>${struttura.NomeLocalita}</td><td>${struttura.Tipologie}</td><td>${struttura.TipoEsteso}</td><td>${struttura.Denominazione}</td><td>${struttura.Indirizzo}</td><td>${struttura.Telefono}</td><td>${struttura.Latitudine}</td><td>${struttura.Longitudine}</td></tr>`;
					$("#risultatiTable tbody").append(tableRow)
				});

				//stilizzo la tabella
				$('#risultatiTable').DataTable({
					"pagingType": "full_numbers",
					"displayStart": 50
				});
			})
			.fail(function (jqxhr, textStatus, error) {
				var err = textStatus + ", " + error;
				console.log("Request Failed: " + err);
			});

		//hide loading
		$("div.wrap-loader").hide();
		$("div#page").show();
	}
		
});
