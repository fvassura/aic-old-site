/*
 * VERSION: 1.4.2
 * 
 * version 1.4.2 2016-09-29
 *      Aggiunti a dettagli struttura campi "takeAway" e "guestsOnly"
 * version 1.4.1 2015-11-03
 *      Bugfix cartella immagini collaborazioni
 * version 1.4 2015-04-22
 *      Aggiunta opzione forceVisibilityAppExpo: false
 *      Il parametro region può anche essere un array di id di regioni
 * version 1.3 2015-03-16
 *      Aggiunta opzione showTypologies: true
 * version 1.2 2015-03-06
 *      Impostata come default la ricerca per provincia
 *      aggiunto il parametro showMoreDetails
 *      rinominato il parametro defaultNextToMeWindowWithoutMap in defaultNextToMeDistance
 *      Aggiunto slider che determina il raggio di ricerca del next to me (non più lo zoom)
 * version 1.1 2015-02-03 
 *      Aggiunto parametro display: 'responsive' | 'mobile' | 'desktop';
 *      modifiche per supportare unico sorgente
 *      aggiunto parametro startSearchWhenReady
 * version 1.0 2015-01-30 Pubblicazione su celiachia.it
 * 
 * 
 * 
 * USAGE:
 * $().createWidgetAfc({
 *      language: 'it',                 // used to query server and translate widget labels
 *      
 *      searchDiv: '#widgetAfcSearch',  // will contain the search form
 *      mapDiv: '#widgetAfcMap',        // will contain the map
 *      resultsDiv: '#widgetAfcResults',// will contain the search results
 *      resultsMobileDiv: '#widgetAfcResultsMobile',// will contain the search results, mobile version
 *      
 *      display: 'responsive' | 'mobile' | 'desktop', //how the widget should be displayed, default: responsive
 *      
 *      mapsApiKey: '',                 //Google Maps JavaScript API v3 Key
 *      
 *      region: null,                   // if set to a specific region (or array of regions), only results for that region(s) are retrieved
 *      filterByProvince: true,         // if true, results can be filtered by province
 *      excludeCategories: [],          // these categories(id) do not exist
 *      
 *      webservicesUrl: 'http://afcaic.it/webservices/common/',        //base url for json webservices
 *      collaborationsImgPath: 'http://www.celiachia.it/public/AFC/COLLABORAZIONI/LOGHI/',
 *      typologiesImgPath: 'http://afcaic.it/uploads/', //base path for collaborations images
 *      categoriesImgPath: 'http://afcaic.it/uploads/', //base path for collaborations images
 *      
 *      tableHeight: 300,
 *      defaultMapOptions: {
 *          center: {lat:41.9100711, lng:12.5359979}, //Rome
 *          zoom: 5,
 *          styles: []
 *      },
 *      markerClustering: true,
 *      showMoreDetails: true,
 *      showTypologies: true,
 *      
 *      defaultNextToMeDistance: 20 // default window width for "next to me" searches,
 *      
 *      startSearchWhenReady: true //if true, a no param search si started as soon as the widget is ready
 * }
 * 
 * BEHAVIOR:
 * - on first load, automatically searches for all venues and places them on the map, but keeping the center and zoom as set
 * 
 */


/*
 * To support Internet Explorer 8, [es5-shim](https://github.com/kriskowal/es5-shim/) must be added your page.
 */

(function ( $ ) {

    var widgetSourceUrl = 'https://afcaic.it/webservices/widget_afc/';
    
    var isMapReady = false;
    var isDatatableReady = false;
    var isDatatableMobileReady = false;

    $.fn.createWidgetAfc = function( options ) {
        //translations
        var labels;
        //map
        var map = null;
        var markers = Array();
        var clusterer = null;
        var infowindow;
        var $infoWindowDiv;
        var datatable;
        var datatableMobile;
        var coords = null;
        var latestSearchResults = null;
        var $loadingModal;
        
        
        // These are the defaults.
        var settings = $.extend({
            'language': getUserLanguage(),
            
            'searchDiv': '#widgetAfcSearch',
            'mapDiv': '#widgetAfcMap',
            'resultsDiv': '#widgetAfcResults',
            'resultsMobileDiv': '#widgetAfcResultsMobile',
            
            'display': 'responsive',
            
            'mapsApiKey': '',
            
            'region': null,
            'filterByProvince': true,
            'excludeCategories': [],
            'forceVisibilityAppExpo': false,
            
            'webservicesUrl': 'https://afcaic.it/webservices/common/',        //base url for json webservices
            'collaborationsImgPath': 'https://afcaic.it/uploads/',
            'typologiesImgPath': 'https://afcaic.it/uploads/', //base path for collaborations images
            'categoriesImgPath': 'https://afcaic.it/uploads/', //base path for collaborations images
            
            'tableHeight': 300,
            defaultMapOptions: {
                'center': {'lat':41.9100711, 'lng':12.5359979}, //Rome
                'zoom': 5
            },
            'markerClustering': true,
            'showMoreDetails': true,
            'showTypologies': true,
            
            'defaultNextToMeDistance': 20, //km
             
            'startSearchWhenReady': true
        }, options );
        
        if(! $.inArray(settings.display, Array('responsive', 'mobile', 'desktop')) ){
            settings.display = 'responsive'; //default
        }
        
        setLanguage(settings.language);
        var exportUrl = settings.webservicesUrl + "exportHtml.php";
 
 
        $formDiv = $(settings.searchDiv);
        $mapDiv = $(settings.mapDiv);
        $resultsDiv = $(settings.resultsDiv);
        $resultsMobileDiv = $(settings.resultsMobileDiv);
        
        $formDiv.addClass('wafc-search');
        $mapDiv.addClass('wafc-map');
        $resultsDiv.addClass('wafc-results');
        $resultsMobileDiv.addClass('wafc-results-mobile');
        
        /*
         * DISPLAY
         */
        switch(settings.display){
            case 'responsive':
            default:
                $resultsMobileDiv.addClass("visible-sm");
                $resultsMobileDiv.addClass("visible-xs");
                $resultsDiv.addClass("hidden-sm");
                $resultsDiv.addClass("hidden-xs");
                break;
            case 'mobile':
                $resultsDiv.addClass("wafc_hidden");
                break;
            case 'desktop':
                $resultsMobileDiv.addClass("wafc_hidden");
                break;
        }
        
        
        function checkReady(){
            if(settings.startSearchWhenReady){
                if(isMapReady && isDatatableReady && isDatatableMobileReady){
                    emptySearch();
                }
            }
        }
        
        function emptySearch(){
            startSearch({
                'idCategoriaTipologia': null,
                'idRegioneItalia': settings.region,
                'denominazioneStruttura': null,
                'excludeCategories':    settings.excludeCategories,
                'forceVisibilityAppExpo': settings.forceVisibilityAppExpo
            }, false);
        }
        
 
        //<editor-fold defaultstate="collapsed" desc="Search form creation">
        
        
        
        //region (optional)
        var $regionSelect = new wafcSelect('wafc_region', 
            labels.region, settings.webservicesUrl+'getRegioniJson.php', 'NomeRegione', 'ID', 
            settings.region !== null, settings.region, false, {'idRegioneItalia': settings.region})
            .createInDom($formDiv, labels);
    
        //typology
        var categoryTypologyUrl = 
                settings.showTypologies ? 
                settings.webservicesUrl+'getCategorieTipologieJson.php' : 
                settings.webservicesUrl+'getCategorieJson.php';
        var $categoryTypologySelect = new wafcSelect('wafc_category-typology', 
            labels.typology, categoryTypologyUrl, 'Descrizione', 'ID', 
            false, null, false, {'excludeCategories': settings.excludeCategories, 'language': settings.language, 'forceVisibilityAppExpo': settings.forceVisibilityAppExpo},
            function(item, escape){ /* renderOptionFunction */
                var cl = '';
                var value = item['ID'];
                if (value === "") cl = 'wafc_placeholder';
                
                //category or typology??
                //only useful if settings.showTypologies==true
                if(settings.showTypologies){
                    var split = value.split('-');
                    if(split.length == 2){ /* exclude placeholder... */
                        switch(split[0]){
                            case 'c':
                                cl += " wafc_categoryOption";
                                break;
                            case 't':
                                cl += " wafc_typologyOption";
                                break;
                            default: break;
                        }
                    }
                }
                
                return '<div data-value="'+escape(value)+'" data-selectable="" class="option '+cl+'">'+escape(item['Descrizione'])+'</div>';
            })
            .createInDom($formDiv, labels);

        //denomination
        var $denominationSelect = new wafcSelect('wafc_denomination', 
            labels.denomination, settings.webservicesUrl+'getDenominazioneJson.php', 'label', 'value', 
            false, null, true, {'idRegioneItalia': settings.region, 'excludeCategories': settings.excludeCategories, 'forceVisibilityAppExpo': settings.forceVisibilityAppExpo})
            .createInDom($formDiv, labels);
 
        //search type
        // => by address (possibly the only supported one)
        if (navigator && navigator.geolocation){
            createRadio({
                'name': 'wafc_searchType',
                'options': [
                    { 'label': labels.nextToMe, 'value': 'nextToMe'},
                    { 'label': labels.byAddress, 'value': 'byAddress'}
                ],
                'defaultValue': 1
            });
            $("input:radio[name='wafc_searchType']").change(function(){
                toggleByAddressForm(true);
            });
            $(settings.searchDiv).append('<div id="wafc_byAddressForm"></div>');
            var $byAddressDiv = $("#wafc_byAddressForm");
        }
        else{
            //browser doesn't support geolocation: no radio options, search by location always visible
            var $byAddressDiv = $formDiv;
        }
        // => by distance from me
        $(settings.searchDiv).append('<div id="wafc_byDistanceForm"></div>');
        var $byDistanceDiv = $("#wafc_byDistanceForm");
        $byDistanceDiv.append('<label>'+labels.distanzaMassima+'</label><div id="wafc_distanceSlider"></div>');
        $( "#wafc_distanceSlider" ).slider({
            min: 5,
            max: 50,
            step: 5,
            value: settings.defaultNextToMeDistance
        }).each(function() {
            // Add labels to slider whose values 
            // are specified by min, max

            // Get the options for this slider (specified above)
            var opt = $(this).data().uiSlider.options;

            // Get the number of possible values
            var vals = opt.max - opt.min;

            // Position the labels
            for (var i = 0; i <= vals; i+=opt.step) {

                // Create a new element and position it with percentages
                var el = $('<label>' + (i + opt.min) + '</label>').css('left', (i/vals*100) + '%');

                // Add the element inside #slider
                $("#wafc_distanceSlider").append(el);

            }
        });
 
        //province (optional)
        var $provinceSelect = new wafcSelect('wafc_province', 
            labels.province, settings.webservicesUrl+'getProvinceJson.php', 'NomeProvincia', 'ID', 
            settings.filterByProvince===false, null, false, {'idRegioneItalia': settings.region})
            .createInDom($byAddressDiv, labels);

        //locality
        var $localitySelect = new wafcSelect('wafc_locality', 
            labels.locality, settings.webservicesUrl+'getCittaJson.php', 'label', 'value', 
            false, null, true, {'idRegioneItalia': settings.region, 'excludeCategories': settings.excludeCategories, 'forceVisibilityAppExpo': settings.forceVisibilityAppExpo})
            .createInDom($byAddressDiv, labels);

        
        // SEARCH BUTTON
        $(settings.searchDiv).append('<div class="wafc_searchBtnWrapper"><input type="button" id="wafc_searchBtn" value="'+labels.search+'" /></div>');
        $("#wafc_searchBtn").click(function(){
            startSearch(null, true);
        });
        
        
        //province depends on region
        $provinceSelect.onRelatedSelectValueChanged = function(id, value){
            this.reload({
                'idRegioneItalia': $regionSelect.getValue()
            });
        };
        $regionSelect.addChangeListener($provinceSelect);
        
        
        //denomination depends on all the other selects
        $denominationSelect.onRelatedSelectValueChanged = function(id, value){
            this.reload({
                'idRegioneItalia':      $regionSelect.getValue(),
                'idCategoriaTipologia': $categoryTypologySelect.getValue(),
                'idProvincia':          $provinceSelect.getValue(),
                'nomeLocalita':         $localitySelect.getValue(),
                'excludeCategories':    settings.excludeCategories,
                'forceVisibilityAppExpo': settings.forceVisibilityAppExpo
            });
        };
        $regionSelect.addChangeListener($denominationSelect);
        $categoryTypologySelect.addChangeListener($denominationSelect);
        $provinceSelect.addChangeListener($denominationSelect);
        $localitySelect.addChangeListener($denominationSelect);
        
        //locality depends on all the other selects
        $localitySelect.onRelatedSelectValueChanged = function(id, value){
            this.reload({
                'idRegioneItalia':      $regionSelect.getValue(),
                'idCategoriaTipologia': $categoryTypologySelect.getValue(),
                'idProvincia':          $provinceSelect.getValue(),
                'nomeStruttura':        $denominationSelect.getValue(),
                'excludeCategories':    settings.exceludeCategories,
                'forceVisibilityAppExpo': settings.forceVisibilityAppExpo
            });
        };
        $regionSelect.addChangeListener($localitySelect);
        $categoryTypologySelect.addChangeListener($localitySelect);
        $provinceSelect.addChangeListener($localitySelect);
        $denominationSelect.addChangeListener($localitySelect);
        

        toggleByAddressForm(false);

        
        //</editor-fold>
 

        //<editor-fold defaultstate="collapsed" desc="Map creation">
        
        //carico in modo asincrono le api di GMaps
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=mapCreation&key='+settings.mapsApiKey;
        document.body.appendChild(script);
        
        
        window.mapCreation = function(){
            if(typeof(google) !== "undefined"){ //xp                

                //create the map with default center
                map = new google.maps.Map($mapDiv[0],  settings.defaultMapOptions);
//                map.setCenter(coords);
                
                $infoWindowDiv = $(
                    "<div id='wafc_infoWindow_div'> "+
                    "   <div class='clearfix'> "+
                    "       <span class='detailTitle'><h4 id='wafc_infoWindow_denomination'></h4></span><span id='wafc_infoWindow_typologies'></span>"+
                    "       <div class='detailBtnContainer'> "+
                    "           <button type='button' class='wafc-button btn-esporta'><img src='"+widgetSourceUrl+"img/esporta.png' alt='esporta'/><div>"+labels.esporta+"</div></button> "+
                    "           <button type='button' class='wafc-button btn-dettagli' id='wafc_details_moreinfo'><img src='"+widgetSourceUrl+"img/lente.png' alt='dettagli'><div>"+labels.schedaLocale+"</div></button> "+
                    "       </div>" + 
                    "   </div>" + 
                    "   <ul> "+
                    "       <li>"+labels.typology+": <span id='wafc_infoWindow_typologiesnames'></span></li>"+
                    "       <li>"+labels.address+": <span id='wafc_infoWindow_address'></span> <a target='_blank' id='wafc_infoWindow_directionsLink' href='#'>"+labels.directions+"</a></li> "+
                    "       <li>"+labels.representative+": <span id='wafc_infoWindow_representative'></span></li> "+
                    "       <li>"+labels.website+": <span id='wafc_infoWindow_website'></span></li> "+
                    "       <li>"+labels.email+": <span id='wafc_infoWindow_email'></span></li> "+
                    "       <li>"+labels.phone+": <span id='wafc_infoWindow_phone'></span></li>"+
                    "       <li>"+labels.mobilePhone+": <span id='wafc_infoWindow_mobilePhone'></span></li>"+
                    "       <li>"+labels.notes+": <span id='wafc_infoWindow_notes'></span></li> "+
                    "       <li>"+labels.price+": <span id='wafc_infoWindow_price'></span></li> "+
                    "       <li>"+labels.closed+": <span id='wafc_infoWindow_closed'></span></li> "+
                    "       <li>"+labels.guestsOnly+": <span id='wafc_infoWindow_guestsonly'></span></li> "+
                    "       <li>"+labels.takeAway+": <span id='wafc_infoWindow_takeaway'></span></li> "+
                    "       <li>"+labels.collaborations+": <span id='wafc_infoWindow_collaborations'></span></li> "+
                    "   </ul> "+
                    "</div> "
                );
                $infoWindowDiv.on("click", "#wafc_details_moreinfo", function(){
                    openDettaglioStruttura();
                });
                $infoWindowDiv.on("click", ".btn-esporta", function(){
                    exportStructureDetails();
                });

                infowindow = new google.maps.InfoWindow({
                    'content': $infoWindowDiv[0],
                    'pixelOffset': new google.maps.Size(0, -34)
                });

            }
            else{
                $mapDiv.css("height", "50px");
            }
            
            //anyway...
            //don't wait for the map to initialize since I don't need it to perform the search
            isMapReady = true;
            checkReady();
        };
        
        //</editor-fold>
        

        //<editor-fold defaultstate="collapsed" desc="Result table creation">
            $resultsDiv.append(
                "<div class='detailBtnContainer'> "+
                "   <span class='wafc_results_number'></span> "+
                "   <button type='button' class='wafc-button btn-esporta wafc_results_table_export'><img src='"+widgetSourceUrl+"img/esporta.png' alt='esporta' />"+labels.exportAll+"</button>"+
                "</div> "+
                "<table id='wafc_results_table' cellspacing='0' width='100%'> "+
                "    <thead> "+
                "       <tr> "+
                "           <th>&nbsp;</th>  "+
                "           <th class='wafc_hidden'>id</th>  "+
                "           <th>"+labels.typology+"</th>  "+
                "           <th>"+labels.locality+"</th>  "+
                "           <th>"+labels.province+"</th>  "+
                "           <th>"+labels.denomination+"</th>  "+
                "           <th>"+labels.address+"</th>  "+
                "           <th>"+labels.phone+"</th>  "+
                "       </tr> "+
                "   </thead> "+
                "</table>"
            );
    
            var datatableInit = {
                'dom': 't',
                'scrollY': settings.tableHeight,
                'aoColumns': [
                    { 
                        "mData": null ,
                        "mRender" : function ( data, type, full ) {
                            return "<button type='button' class='wafc-button btn-dettagli'><img src='"+widgetSourceUrl+"img/lente.png' alt='dettagli' /></button>";
                        }
                    },
                    { 'data': "ID", 'class': "wafc_id wafc_hidden" },
                    { 'data': "TipoEsteso" },
                    { 'data': "NomeLocalita" },
                    { 'data': "NomeProvincia" },
                    { 'data': "Denominazione" },
                    { 'data': "Indirizzo" },
                    { 'data': "Telefono" }
                ],
                'columnDefs': [
                    {
                        'targets': [ 0],
                        'sortable': false
                    },
                    {
                        'targets': [ 1 ],
                        'searchable': false
                    }
                ],
                'aaSorting': [[ 2, "asc" ]],
                'paging': false,
                'bDestroy': true,
                'stripeClasses': ['dispari', 'pari'],
                'fnInitComplete': function(){
                    isDatatableReady = true;
                    checkReady();
                }
            };
            if(settings.language == "it"){
                datatableInit.language = datatableIt;
            }
            
            datatableInit.initComplete = function(){
                $(".dataTables_scrollHead").attr("style", "");
                $(".dataTables_scrollBody").attr("style", "");
            };
            datatable = $('#wafc_results_table').dataTable(datatableInit);
            
        //</editor-fold>
 
        
        //<editor-fold defaultstate="collapsed" desc="Mobile result table creation">
            $resultsMobileDiv.append(
                "<div class='detailBtnContainer'> "+
                "   <span class='wafc_results_number'></span> "+
                "   <button type='button' class='wafc-button btn-esporta wafc_results_table_export'><img src='"+widgetSourceUrl+"img/esporta.png' alt='esporta' />"+labels.exportAll+"</button>"+
                "</div> "+
                "<table id='wafc_results_table_mobile' cellspacing='0' width='100%'> "+
                "    <thead> "+
                "       <tr> "+
                "           <th>&nbsp;</th>  "+
                "           <th class='wafc_hidden'>id</th>  "+
                "           <th>"+labels.structure+"</th>  "+
                "           <th class='wafc_hidden'>id</th>  "+
                "       </tr> "+
                "   </thead> "+
                "</table>"
            );
    
            var datatableMobileInit = {
                'dom': 't',
                'scrollY': settings.tableHeight,
                'aoColumns': [
                    { 
                        "mData": null ,
                        "mRender" : function ( data, type, full ) {
                            return "<button type='button' class='wafc-button btn-dettagli'><img src='"+widgetSourceUrl+"img/lente.png' alt='dettagli' /></button>";
                        }
                    },
                    { 'data': "ID", 'class': "wafc_id wafc_hidden" },
                    { 
                        "mData": null ,
                        "mRender" : function ( data, type, full ) {
                            return "<strong>"+data.Denominazione+"</strong><br/>"+
                                data.TipoEsteso+"<br/>"+
                                data.Indirizzo+", "+data.NomeLocalita+" ("+data.NomeProvincia+", "+data.NomeRegioneItalia+") <br/>"+
                                data.Telefono;
                        }
                    },
                    { 'data': "TipoEsteso", 'class': "wafc_id wafc_hidden" }
                ],
                'columnDefs': [
                    {
                        'targets': [0,1,2],
                        'sortable': false,
                        'searchable': false
                    }
                ],
                'aaSorting': [[ 3, "asc" ]],
                'paging': false,
                'bDestroy': true,
                'stripeClasses': ['dispari', 'pari'],
                'fnInitComplete': function(){
                    isDatatableMobileReady = true;
                    checkReady();
                }
            };
            if(settings.language == "it"){
                datatableMobileInit.language = datatableIt;
            }
            
            datatableMobileInit.initComplete = function(){
                $(".dataTables_scrollHead").attr("style", "");
                $(".dataTables_scrollBody").attr("style", "");
            };
            datatableMobile = $('#wafc_results_table_mobile').dataTable(datatableMobileInit);
            
        //</editor-fold>


        $('#wafc_results_table tbody, #wafc_results_table_mobile tbody').on( 'click', 'tr', function () {
//          $("#wafc_results_table tbody tr.selected").removeClass("selected");
//          $(this).addClass("selected");

            var id = parseInt($(this).find(".wafc_id").first().html());
            fillDettaglioStruttura(id, function(){
                //if map is shown, open popup on map;
                //otherwise, open whole popup
                if(typeof(google) !== "undefined"){ 
                    openInfoWindow(id);
                }
                else{
                    openDettaglioStruttura();
                }
            });
        } );

        $('.wafc_results_table_export').on('click', function(){
            exportResultsTable();
        });
        
            
        
        //<editor-fold defaultstate="collapsed" desc="Details creation">
            $detailsDiv = $(
                '<div class="modal fade" id="wafc_details" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'+
                    '<div class="modal-dialog">'+
                    '  <div class="modal-content">'+
                    '    <div class="modal-header">'+
                    '       <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                    "       <span><h4 class='modal-title detailTitle' id='wafc_details_title'></h4></span><span id='wafc_details_typologies'></span>" + 
                    "       <div class='detailBtnContainer'>"+
                    "           <button type='button' class='wafc-button btn-esporta' id='wafc_details_esporta'><img src='"+widgetSourceUrl+"img/esporta.png' alt='esporta'/><div>"+labels.esporta+"</div></button>"+
                    "       </div>" + 
                    '    </div>'+
                    '    <div class="modal-body" id="wafc_details_body">'+
                    "       <ul> "+
                    "           <li class='nopadding'></li> "+
                    "           <li>"+labels.typology+": <span id='wafc_details_typologiesnames'></span></li>"+
                    "           <li>"+labels.address+": <span id='wafc_details_address'></span> <a target='_blank' id='wafc_details_directionsLink' href='#'>"+labels.directions+"</a></li> "+
                    "           <li>"+labels.representative+": <span id='wafc_details_representative'></span></li> "+
                    "           <li>"+labels.website+": <span id='wafc_details_website'></span></li> "+
                    "           <li>"+labels.email+": <span id='wafc_details_email'></span></li> "+
                    "           <li>"+labels.phone+": <span id='wafc_details_phone'></span></li>"+
                    "           <li>"+labels.mobilePhone+": <span id='wafc_details_mobilePhone'></span></li>"+
                    "           <li>"+labels.notes+": <span id='wafc_details_notes'></span></li> "+
                    "           <li>"+labels.price+": <span id='wafc_details_price'></span></li> "+
                    "           <li>"+labels.closed+": <span id='wafc_details_closed'></span></li> "+
                    "           <li>"+labels.guestsOnly+": <span id='wafc_details_guestsonly'></span></li> "+
                    "           <li>"+labels.takeAway+": <span id='wafc_details_takeaway'></span></li> "+
                    "           <li>"+labels.collaborations+": <span id='wafc_details_collaborations'></span></li> "+
                    "       </ul> "+
                    "       <div id='wafc_details_moreinfo'>" + 
                    "           <h5 id='wafc_details_toggle_more'>"+labels.moreInfo+"</h5> "+
                    "           <ul> "+
                    "               <li>"+labels.altreinfo_prenotazioneobbligatoria+": <span id='wafc_details_altreinfo_prenotazioneobbligatoria'></span></li> "+
                    "               <li>"+labels.altreinfo_tipicucina+": <span id='wafc_details_altreinfo_tipicucina'></span></li> "+
                    "               <li>"+labels.altreinfo_tipicitaterritorio+": <span id='wafc_details_altreinfo_tipicitaterritorio'></span></li> "+
                    "               <li>"+labels.altreinfo_caratteristichecucina+": <span id='wafc_details_altreinfo_caratteristichecucina'></span></li>"+
                    "               <li>"+labels.altreinfo_pizza+": <span id='wafc_details_altreinfo_pizza'></span></li>"+
                    "               <li>"+labels.altreinfo_dedicato+": <span id='wafc_details_altreinfo_dedicato'></span></li> "+
                    "               <li>"+labels.altreinfo_orariapertura+": <span id='wafc_details_altreinfo_orariapertura'></span></li> "+
                    "               <li>"+labels.altreinfo_chiusuraferie+": <span id='wafc_details_altreinfo_chiusuraferie'></span></li> "+
                    "               <li id='wafc_details_altreinfo_numerocoperti'>"+labels.numeroCoperti+":"+
                    "                   <ul>"+
                    "                       <li>"+labels.altreinfo_numerocopertisalainterna+": <span id='wafc_details_altreinfo_numerocopertisalainterna'></span></li> "+
                    "                       <li>"+labels.altreinfo_numerocopertisalaricevimento+": <span id='wafc_details_altreinfo_numerocopertisalaricevimento'></span></li> "+
                    "                       <li>"+labels.altreinfo_numerocopertidehor+": <span id='wafc_details_altreinfo_numerocopertidehor'></span></li> "+
                    "                       <li>"+labels.altreinfo_numerocamere+": <span id='wafc_details_altreinfo_numerocamere'></span></li> "+
                    "                   </ul>"+
                    "               </li>"+
                    "               <li>"+labels.altreinfo_intolleranze+": <span id='wafc_details_altreinfo_intolleranze'></span></li> "+
                    "               <li id='wafc_details_altreinfo_veg'>"+labels.piattiIdoneiPer+": "+
                    "                   <span id='wafc_details_altreinfo_vegetariani'>"+labels.altreinfo_vegetariani+"</span> "+
                    "                   <span id='wafc_details_altreinfo_vegseparator'>,</span> "+
                    "                   <span id='wafc_details_altreinfo_vegani'>"+labels.altreinfo_vegani+"</span> "+
                    "               </li>"+
                    "               <li>"+labels.altreinfo_guideristorazione+": <span id='wafc_details_altreinfo_guideristorazione'></span></li> "+
                    
                    "               <li>"+labels.altreinfo_menu+": <span id='wafc_details_altreinfo_menu'></span></li> "+
                    "               <li>"+labels.altreinfo_materieprime+": <span id='wafc_details_altreinfo_materieprime'></span></li> "+
                    "               <li id='wafc_details_altreinfo_inmenupresente'> "+labels.inMenuPresente+":"+
                    "                   <ul>"+
                    "                       <li><span id='wafc_details_altreinfo_tipopane'></span></li> "+
                    "                       <li><span id='wafc_details_altreinfo_tipopasta'></span></li> "+
                    "                       <li><span id='wafc_details_altreinfo_tipodolci'></span></li> "+
                    "                       <li><span id='wafc_details_altreinfo_tipopizza'></span></li> "+
                    "                   </ul>"+
                    "               </li>"+
                    "               <li>"+labels.altreinfo_propostedisponibili+": <span id='wafc_details_altreinfo_propostedisponibili'></span></li> "+
                    "               <li>"+labels.altreinfo_menubambini+": <span id='wafc_details_altreinfo_menubambini'></span></li> "+
                    "               <li>"+labels.altreinfo_birrasenzaglutine+": <span id='wafc_details_altreinfo_birrasenzaglutine'></span></li> "+
                    "               <li>"+labels.altreinfo_prezzopietanzesguguale+": <span id='wafc_details_altreinfo_prezzopietanzesguguale'></span></li> "+
                    "               <li>"+labels.altreinfo_prezzopizzesguguale+": <span id='wafc_details_altreinfo_prezzopizzesguguale'></span></li> "+
                    
                    "               <li>"+labels.altreinfo_servizi+": <span id='wafc_details_altreinfo_servizi'></span></li> "+
                    "          </ul> "+
                    '       </div> <!-- moreInfo --> '+
                    '    </div>'+
                    '  </div>'+
                    '</div>'+
                '</div>'
            );
    
            $detailsDiv.on( 'click', '#wafc_details_esporta', function () {
                exportStructureDetails();
            } );
    
        //</editor-fold>


        /*
         * FUNCTIONS
         */

        //<editor-fold defaultstate="collapsed" desc="Search functions">
            function startSearch(data, fitMapOnResults){

                if(fitMapOnResults == null) fitMapOnResults = true;

                if(data === null){
                    data =  {
                        'language': settings.language,
                        'idCategoriaTipologia': $categoryTypologySelect.getValue(),
                        'idRegioneItalia': $regionSelect.getValue(),
                        'denominazioneStruttura': $denominationSelect.getValue(),
                        'excludeCategories':    settings.excludeCategories,
                        'forceVisibilityAppExpo': settings.forceVisibilityAppExpo
                    };
                }

                if(isNextToMe()){
                    //reset user coords info to get fresh info
                    coords = null;
                    
                    //center map on user position
                    getUserCoords(function(coords){
                        if(coords === null){
                            feedback(labels.noCoordinateUtente);
                        }
                        else{
                            var distance = $('#wafc_distanceSlider').slider("option", "value");
                            $.extend(data, {
                                'centerLat': coords.lat,
                                'centerLng': coords.lng,
                                'maxDistance': distance
                            });


                            auxDoSearch(data, fitMapOnResults);
                        }
                    });
                }
                else{
                    $.extend(data, {
                        'idProvincia': $("#wafc_province").val(),
                        'nomeCitta': $("#wafc_locality").val()
                    });

                    auxDoSearch(data, fitMapOnResults);
                }
            }

            function auxDoSearch(data, fitMapOnResults){
                showLoading();
                $.ajax({
                    'url': settings.webservicesUrl + "getRisultatoRicercaJson.php",
                    'type': 'GET',
                    'dataType': 'jsonp',
                    'data': data,
                    error: function() {
                        //boh
                    },
                    success: function(res) {
                        onGotSearchResults(res, fitMapOnResults);
                        hideLoading();
                    }
                });
            }


            function onGotSearchResults(strutture, fitMapOnResults){
                latestSearchResults = strutture;

                /*
                 * MAP
                 */
                if(map !== null){
                    //delete all markers
                    for(var i=0; i<markers.length; i++){
                        markers[i].setMap(null);
                    }
                    if(clusterer !== null){
                        clusterer.clearMarkers();
                    }
                    markers = Array();

                    var bounds = new google.maps.LatLngBounds();

                    for(var i=0; i<strutture.length; i++){
                        var coords = new google.maps.LatLng(strutture[i].Latitudine, strutture[i].Longitudine);
                        var markerData = {
                            'position': coords,
                            'title' : strutture[i].Denominazione,
                            'id': strutture[i].ID
                        };
                        if(strutture[i].IconaCategoriaGuida !== null){
                            $.extend(markerData, {
                                'icon': settings.categoriesImgPath + strutture[i].IconaCategoriaGuida
                            });
                        }
                        if(settings.markerClustering === false){
                            markerData.map = map;
                        }
                        var marker = new google.maps.Marker(markerData);


                        markers.push(marker);
                        bounds.extend(coords);

                        google.maps.event.addListener(marker, 'click', function() {
                            var id = this.id;
                            fillDettaglioStruttura(id, function(){
                                openInfoWindow(id);
//                                openDettaglioStruttura();
                            });
                        });
                    }

                    if(settings.markerClustering){
                        if(clusterer === null){
                            clusterer = new MarkerClusterer(map, markers, { 'minimumClusterSize': 5 });
                        }
                        else{
                            clusterer.addMarkers(markers);
                        }
                    }

                    if(fitMapOnResults && strutture.length !== 0){
                        map.fitBounds(bounds);
                        map.setCenter(bounds.getCenter());
                    }
                }


                /*
                 * RESULTS
                 */
                datatable.fnClearTable();
                if(strutture.length !== 0){
                    datatable.fnAddData(strutture);
                }
                datatableMobile.fnClearTable();
                if(strutture.length !== 0){
                    datatableMobile.fnAddData(strutture);
                }
                
                /*
                 * RESULTS NUMBER
                 */
                $(".wafc_results_number").html(labels.resultsNumber + strutture.length);
            }
        //</editor-fold>
        
        
        //<editor-fold defaultstate="collapsed" desc="Map utilities">
        
            function fillDettaglioStruttura(id, callback){
                showLoading();
                $.ajax({
                    'url': settings.webservicesUrl + "getDettaglioStrutturaJson.php",
                    'type': 'GET',
                    'dataType': 'jsonp',
                    data: {
                        'idStruttura': id,
                        'language': settings.language
                    },
                    error: function() {
                        //boh
                    },
                    success: function(dettaglio) {
    //                    console.log(dettaglio);
                        hideLoading();
                        auxFillDettaglioStruttura(dettaglio);
                        if (typeof(callback) != 'undefined') callback(dettaglio);
                    }
                });
                
            }
        
            function openInfoWindow(id){
                if(map === null) return;
                
                var found = false;
                for(var i=0; !found && i<markers.length; i++){
                    var m = markers[i];
                    if(m.id === id){
                        found = true;
                        infowindow.setPosition(m.position);
                        infowindow.open(map);
                        $mapDiv.smoothlyScrollToMe();
                    }
                }
            }
            
            function openDettaglioStruttura(){
                $detailsDiv.modal('show');
            }
            
        //</editor-fold>
        
        
        //<editor-fold defaultstate="collapsed" desc="Form creation utilities">
            function createRadio(options){

                var opt = $.extend({
                    'language': settings.language,
                    'div': settings.searchDiv,
                    'name': '',
                    'options': [],
                    'hidden': false,
                    'defaultValue': -1
                }, options );

                var $div = $(opt.div);
                var hiddenStyle = opt.hidden === true ? 'style="{display:none;}"' : '';


                var $radioDiv = $div.append('<div></div>');

                for(var i=0; i<opt.options.length; i++){
                    var checked = opt.defaultValue === i ? 'checked="checked"' : '';
                    var value = opt.options[i].value;
                    var label = opt.options[i].label;

                    $radioDiv.append(
                        '<div class="wafc_radioWrapper">'+
                        '   <input type="radio" name="'+opt.name+'" value="'+value+'" '+hiddenStyle+' '+checked+' /> '+
                        '   <label>'+label+'</label> '+
                        '</div>'
                    );
                }

            }
        //</editor-fold>
 
 
        //<editor-fold defaultstate="collapsed" desc="Open dettaglio struttura">
        
            $(document).on('click', "#wafc_infoWindow_directionsLink, #wafc_details_directionsLink", function(event){
                getDirections($(this), $(this).attr("data-lat"), $(this).attr("data-lng"));
                event.preventDefault();
            });
            
            function getDirections(link, lat, lng){
                getUserCoords(function(coords){
                    var userPos = '';
                    
                    if (coords !== null){
                        userPos = coords.lat+","+coords.lng;
                    }

                    var url = "https://www.google.com/maps/dir/"+userPos+"/"+lat+","+lng+"/";
//                    link.attr("href", url);
                    window.location.href  = url;
                    
                });
            }
        
            function auxFillDettaglioStruttura(dettaglio){
                var indirizzo = dettaglio.Indirizzo+", "+dettaglio.NomeLocalita+
                                " ("+dettaglio.SiglaProvincia+", "+dettaglio.NomeRegioneItalia+") ";

                $infoWindowDiv.find("#wafc_infoWindow_directionsLink").attr("data-lat", dettaglio.Latitudine);
                $infoWindowDiv.find("#wafc_infoWindow_directionsLink").attr("data-lng", dettaglio.Longitudine);
                $detailsDiv.find("#wafc_details_directionsLink").attr("data-lat", dettaglio.Latitudine);
                $detailsDiv.find("#wafc_details_directionsLink").attr("data-lng", dettaglio.Longitudine);
//                var url = "https://www.google.com/maps/dir/Current+Location/"+dettaglio.Latitudine+","+dettaglio.Longitudine+"/";
//                $infoWindowDiv.find("#wafc_infoWindow_directionsLink").attr("href", url);
//                $detailsDiv.find("#wafc_details_directionsLink").attr("href", url);

                
                
                var collaborazioni = "";
                if(dettaglio.ElencoNomiFileLogoCollaborazioni != null && dettaglio.ElencoNomiFileLogoCollaborazioni != ""){
                    var lc = dettaglio.ElencoNomiFileLogoCollaborazioni.split(",");
                    var nc = dettaglio.ElencoNomiCollaborazioni.split(", ");
                    for (var i =0; i<lc.length; i++){
                        collaborazioni += "<img src='"+settings.collaborationsImgPath+lc[i]+"' alt='"+nc[i]+"'/>";
                    }
                }

                var tipologie = "";
                if(dettaglio.ElencoNomiFileIconeTipologie != null && dettaglio.ElencoNomiFileIconeTipologie != ""){
                    var ac = dettaglio.ElencoNomiFileIconeTipologie.split(",");
                    for (var i =0; i<ac.length; i++){
                        if(ac[i]=="") continue;
                        tipologie += "<img src='"+settings.typologiesImgPath+ac[i]+"'/>";
                    }
                }

                //InfoWindow
                fillData($infoWindowDiv, "#wafc_infoWindow_typologies",     tipologie, null, null);
                fillData($infoWindowDiv, "#wafc_infoWindow_typologiesnames",dettaglio.TipoEsteso, null, null);
                fillData($infoWindowDiv, "#wafc_infoWindow_denomination",   dettaglio.Denominazione, null, null);
                fillData($infoWindowDiv, "#wafc_infoWindow_address",        indirizzo, null, null);
                fillData($infoWindowDiv, "#wafc_infoWindow_phone",          dettaglio.Telefono, '<a href="tel:###">###</a>', null);
                fillData($infoWindowDiv, "#wafc_infoWindow_mobilePhone",    dettaglio.Cellulare, '<a href="tel:###">###</a>', null);
                fillData($infoWindowDiv, "#wafc_infoWindow_email",          dettaglio.Email, '<a target="_blank" href="mailto:###">###</a>', null);
                fillData($infoWindowDiv, "#wafc_infoWindow_representative", dettaglio.ReferenteSG, null, null);
                fillData($infoWindowDiv, "#wafc_infoWindow_notes",          dettaglio.Note, null, null);
                fillData($infoWindowDiv, "#wafc_infoWindow_website",        dettaglio.IndirizzoWeb, '<a target="_blank" href="http://###">###</a>', null);
                fillData($infoWindowDiv, "#wafc_infoWindow_closed",         dettaglio.PeriodoChiusura, null), null;
                fillData($infoWindowDiv, "#wafc_infoWindow_price",          dettaglio.CostoMedioPasto, null, null);
                fillBool($infoWindowDiv, "#wafc_infoWindow_guestsonly",     dettaglio.SoloOspiti, null, 0);
                fillBool($infoWindowDiv, "#wafc_infoWindow_takeaway",       dettaglio.Asporto, null, 0);
                fillData($infoWindowDiv, "#wafc_infoWindow_collaborations", collaborazioni, null, null);

                

                //Detail
                fillData($detailsDiv, "#wafc_details_typologies",     tipologie, null, null);
                fillData($detailsDiv, "#wafc_details_typologiesnames",dettaglio.TipoEsteso, null, null);
                fillData($detailsDiv, "#wafc_details_title",          dettaglio.Denominazione, null), null;
                fillData($detailsDiv, "#wafc_details_address",        indirizzo, null, null);
                fillData($detailsDiv, "#wafc_details_phone",          dettaglio.Telefono, '<a href="tel:###">###</a>', null);
                fillData($detailsDiv, "#wafc_details_mobilePhone",    dettaglio.Cellulare, '<a href="tel:###">###</a>', null);
                fillData($detailsDiv, "#wafc_details_email",          dettaglio.Email, '<a target="_blank" href="mailto:###">###</a>', null);
                fillData($detailsDiv, "#wafc_details_representative", dettaglio.ReferenteSG, null, null);
                fillData($detailsDiv, "#wafc_details_notes",          dettaglio.Note, null), null;
                fillData($detailsDiv, "#wafc_details_website",        dettaglio.IndirizzoWeb, '<a target="_blank" href="http://###">###</a>', null);
                fillData($detailsDiv, "#wafc_details_closed",         dettaglio.PeriodoChiusura, null, null);
                fillData($detailsDiv, "#wafc_details_price",          dettaglio.CostoMedioPasto, null, null);
                fillBool($detailsDiv, "#wafc_details_guestsonly",     dettaglio.SoloOspiti, null, 0);
                fillBool($detailsDiv, "#wafc_details_takeaway",       dettaglio.Asporto, null, 0);
                fillData($detailsDiv, "#wafc_details_collaborations", collaborazioni, null, null);

                var numberMoreData = 0;
                var numberCoperti = 0;
                var numberInMenu = 0;

                numberMoreData += fillBool($detailsDiv, "#wafc_details_altreinfo_prenotazioneobbligatoria", dettaglio.PrenotazioneObbligatoria, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_tipicucina", dettaglio.TipiCucina, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_tipicitaterritorio", dettaglio.TipicitaTerritorio, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_caratteristichecucina", dettaglio.CaratteristicheCucina, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_pizza", dettaglio.Pizza, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_dedicato", dettaglio.Dedicato, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_orariapertura", dettaglio.OrariApertura, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_chiusuraferie", dettaglio.ChiusuraFerie, null, null);
                numberCoperti +=  fillData($detailsDiv, "#wafc_details_altreinfo_numerocopertisalainterna", dettaglio.NumeroCopertiSalaInterna, null, 0);
                numberCoperti +=  fillData($detailsDiv, "#wafc_details_altreinfo_numerocopertisalaricevimento", dettaglio.NumeroCopertiSalaRicevimento, null, 0);
                numberCoperti +=  fillData($detailsDiv, "#wafc_details_altreinfo_numerocopertidehor", dettaglio.NumeroCopertiDehor, null, 0);
                numberCoperti +=  fillData($detailsDiv, "#wafc_details_altreinfo_numerocamere", dettaglio.NumeroCamere, null, 0);
                numberMoreData += numberCoperti;
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_intolleranze", dettaglio.Intolleranze, null, null);

                fillData($detailsDiv, "#wafc_details_altreinfo_intolleranze", dettaglio.Intolleranze, null, null);

                var numberVeg = 0;
                numberVeg += hideOrShow($detailsDiv.find('#wafc_details_altreinfo_vegetariani').first(), dettaglio.CucinaVegetariani, "0");
                numberVeg += hideOrShow($detailsDiv.find('#wafc_details_altreinfo_vegani').first(), dettaglio.CucinaVegani, "0");
                if(numberVeg == 0){
                    $detailsDiv.find('#wafc_details_altreinfo_veg').first().hide();
                    $detailsDiv.find('#wafc_details_altreinfo_veg').first().addClass('hidden');
                }
                else{
                    $detailsDiv.find('#wafc_details_altreinfo_veg').first().show();
                    $detailsDiv.find('#wafc_details_altreinfo_veg').first().removeClass('hidden');
                }
                if(numberVeg != 2){
                    $detailsDiv.find('#wafc_details_altreinfo_vegseparator').first().hide();
                    $detailsDiv.find('#wafc_details_altreinfo_vegseparator').first().addClass('hidden');
                }
                else{
                    $detailsDiv.find('#wafc_details_altreinfo_vegseparator').first().show();
                    $detailsDiv.find('#wafc_details_altreinfo_vegseparator').first().removeClass('hidden');
                }


                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_guideristorazione", dettaglio.GuideRistorazione, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_menu", dettaglio.Menu, null, null);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_materieprime", dettaglio.MateriePrime, null, null);
                numberInMenu +=   fillData($detailsDiv, "#wafc_details_altreinfo_tipopane", dettaglio.TipoPane, null, null);
                numberInMenu +=   fillData($detailsDiv, "#wafc_details_altreinfo_tipopasta", dettaglio.TipoPasta, null, null);
                numberInMenu +=   fillData($detailsDiv, "#wafc_details_altreinfo_tipodolci", dettaglio.TipoDolci, null, null);
                numberInMenu +=   fillData($detailsDiv, "#wafc_details_altreinfo_tipopizza", dettaglio.TipoPizza, null, null);
                numberMoreData += numberInMenu;
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_propostedisponibili", dettaglio.ProposteDisponibili, null, null);
                numberMoreData += fillBool($detailsDiv, "#wafc_details_altreinfo_menubambini", dettaglio.MenuBambini, null, 0);
                numberMoreData += fillBool($detailsDiv, "#wafc_details_altreinfo_birrasenzaglutine", dettaglio.BirraSenzaGlutine, null, 0);
                numberMoreData += fillBool($detailsDiv, "#wafc_details_altreinfo_prezzopietanzesguguale", dettaglio.PrezzoPietanzeSGUguale, null, 0);
                numberMoreData += fillBool($detailsDiv, "#wafc_details_altreinfo_prezzopizzesguguale", dettaglio.PrezzoPizzeSGUguale, null, 0);
                numberMoreData += fillData($detailsDiv, "#wafc_details_altreinfo_servizi", dettaglio.Servizi, null, null);

                if(numberCoperti == 0){
                    $detailsDiv.find("#wafc_details_altreinfo_numerocoperti").first().hide();
                    $detailsDiv.find("#wafc_details_altreinfo_numerocoperti").first().addClass('hidden');
                }
                else{
                    $detailsDiv.find("#wafc_details_altreinfo_numerocoperti").first().show();
                    $detailsDiv.find("#wafc_details_altreinfo_numerocoperti").first().removeClass('hidden');
                }
                if(numberInMenu == 0){
                    $detailsDiv.find("#wafc_details_altreinfo_inmenupresente").first().hide();
                    $detailsDiv.find("#wafc_details_altreinfo_inmenupresente").first().addClass('hidden');
                }
                else{
                    $detailsDiv.find("#wafc_details_altreinfo_inmenupresente").first().show();
                    $detailsDiv.find("#wafc_details_altreinfo_inmenupresente").first().removeClass('hidden');
                }
                
                
                if(numberMoreData == 0){
                    $detailsDiv.find("#wafc_details_moreinfo").first().hide();
                    $detailsDiv.find("#wafc_details_moreinfo").first().addClass('hidden');
                }
                else{
                    $detailsDiv.find("#wafc_details_moreinfo").first().show();
                    $detailsDiv.find("#wafc_details_moreinfo").first().removeClass('hidden');
                }
                
                //should show details?
                if (settings.showMoreDetails && numberMoreData!=0){
                    $infoWindowDiv.find("#wafc_details_moreinfo").first().show();
                }
                else{
                    $infoWindowDiv.find("#wafc_details_moreinfo").first().hide();
                }
 
            }

            function fillData(parent, divId, data, format, notEqualTo){
                if (parent == null || typeof(parent)=='undefined') return;
                
                if(data != null && data != "" && data != notEqualTo){
    //                console.log("ok: "+divId+"= *"+data+"*");
                    var str = data;
                    if(format != null){
                        str = format.replace(/###/g, data);
                    }

                    parent.find(divId).first().html(str);
                    parent.find(divId).first().parents('li').show();
                    parent.find(divId).first().parents('li').removeClass('hidden');
                    return 1;
                }
                else{
    //                console.log("ko: "+divId+"= *"+data+"* => hide ");
    //                console.log(parent.find(divId).first().parent());
                    parent.find(divId).first().parents('li').hide();
                    parent.find(divId).first().parents('li').addClass('hidden');
                    return 0;
                }
            }

            function fillBool(parent, divId, data, format, notEqualTo){
                if (parent == null || typeof(parent)=='undefined') return;
                
                if((data == 1 || data == 0) && data != notEqualTo){
                    var str = data == 1 ? labels.yes : labels.no;
                    parent.find(divId).first().html(str);
                    parent.find(divId).first().parents('li').show();
                    parent.find(divId).first().parents('li').removeClass('hidden');
                    return 1;
                }
                else{
                    parent.find(divId).first().parents('li').hide();
                    parent.find(divId).first().parents('li').addClass('hidden');
                    return 0;
                }
            }

            function hideOrShow(div, data, hideIfEqualTo){
                if (div == null || typeof(div)=='undefined') return;
                
                if(data != null && data != "" && data != hideIfEqualTo){
                    div.show();
                    div.removeClass('hidden');
                    return 1;
                }
                else{
                    div.hide();
                    div.addClass('hidden');
                    return 0;
                }
            }
        //</editor-fold>
 
 
        //<editor-fold defaultstate="collapsed" desc="Export utilities">
            
            function exportResultsTable(){
                //create a temporary datatable
                var $tmp = $(
                    "<div> "+
                    "   <h1>Associazione Italiana Celiachia</h1>"+
                    "   <table cellspacing='0'> "+
                    "       <thead> "+
                    "          <tr> "+
                    "              <th>"+labels.typology+"</th>  "+
                    "              <th>"+labels.locality+"</th>  "+
                    "              <th>"+labels.province+"</th>  "+
                    "              <th>"+labels.denomination+"</th>  "+
                    "              <th>"+labels.address+"</th>  "+
                    "              <th>"+labels.phone+"</th>  "+
                    "          </tr> "+
                    "      </thead> "+
                    "   </table>"+
                    "   <style> "+
//                    "       table{border: 1px solid #aaa; } "+
                    "       th{background-color: #eee;} "+
                    "       th, td{border: 1px solid #aaa; width: 16.6%; padding: 3mm; } "+
                    "   </style> "+
                    "</div>"
                );
                var datatableInit = {
                    'dom': 'tS',
                    'aoColumns': [
                        { 'data': "TipoEsteso" },
                        { 'data': "NomeLocalita" },
                        { 'data': "NomeProvincia" },
                        { 'data': "Denominazione" },
                        { 'data': "Indirizzo" },
                        { 'data': "Telefono" }
                    ],
                    'columnDefs': [
                        {
                            'targets': [],
                            'sortable': false,
                            'searchable': false
                        }
                    ],
                    'aaSorting': [[ 0, "asc" ]],
                    'paging': false,
                    'data': latestSearchResults
                };
                if(settings.language == "it"){
                    datatableInit.language = datatableIt;
                }
                datatable = $tmp.children('table').first().dataTable(datatableInit);
                
                postForExport(
                    {
                        'html': $tmp.html(),
                        'lang': settings.language,
                        'title': labels.structures
                    },
                    'POST'
                );
            }
            
            
            function exportStructureDetails(){
                var $tmp = $detailsDiv.find('.modal-dialog').clone();
                $tmp.find('button').remove();
                $tmp.find('img').each(function(){
                    var alt = $(this).attr("alt");
                    if( typeof(alt)!= 'undefined' && alt != null && alt != ''){
                        if($(this).parent().children(".alt").length != 0) alt= ", "+alt;
                        $(this).parent().append($('<span class="alt">'+alt+'</span>'));
                    }
                    $(this).remove();
                });
                $tmp.find('#wafc_details_directionsLink').remove();
                $tmp.find('ul').css('list-style-type', 'none');
                $tmp.find('ul').css('padding', '0');
                $tmp.find('ul').css('width', '90%');
                $tmp.find('h4').css('margin-bottom', '5px');
                $tmp.find('h5').css('margin-bottom', '2px');
                $tmp.find('.hidden').remove();
                $tmp = $(
                    "<div> "+
                    "   <h1>Associazione Italiana Celiachia</h1>"+
                    "</div>"
                ).append($tmp);

                postForExport(
                    {
                        'html': $tmp.html(),
                        'lang': settings.language,
                        'title': labels.structure
                    },
                    'POST'
                );
            }
        
            function postForExport(params, method) {
                method = method || "post"; // Set method to post by default if not specified.

                // The rest of this code assumes you are not using a library.
                // It can be made less wordy if you use one.
                var form = document.createElement("form");
                form.setAttribute("method", method);
                form.setAttribute("action", exportUrl);
                form.setAttribute("target", "_blank");

                for(var key in params) {
                    if(params.hasOwnProperty(key)) {
                        var hiddenField = document.createElement("input");
                        hiddenField.setAttribute("type", "hidden");
                        hiddenField.setAttribute("name", key);
                        hiddenField.setAttribute("value", params[key]);

                        form.appendChild(hiddenField);
                     }
                }

                document.body.appendChild(form);
                form.submit();
            }
            
        //</editor-fold>
 
 
        //<editor-fold defaultstate="collapsed" desc="Loading utilities">


            function createLoading(){
                $('body').append( $(
                    '<div class="modal fade" id="wafc_loading"> '+
                    '    <div class="modal-dialog modal-sm""> '+
                    '      <div class="modal-content"> '+
//                    '        <div class="modal-header"> '+
//                    '          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> '+
//                    '          <h4 class="modal-title">Modal title</h4> '+
//                    '        </div> '+
                    '        <div class="modal-body"> '+
                    '           <img class="loading" src="'+widgetSourceUrl+'img/loading.gif" />   '+
                    '           <span>'+labels.loading+'</span>'+
                    '        </div> '+
//                    '        <div class="modal-footer"> '+
//                    '          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> '+
//                    '          <button type="button" class="btn btn-primary">Save changes</button> '+
//                    '        </div> '+
                    '      </div><!-- /.modal-content --> '+
                    '    </div><!-- /.modal-dialog --> '+
                    '  </div><!-- /.modal -->'
                ));
                $loadingModal = $("#wafc_loading");
                return $loadingModal;
            }

            function showLoading(){
                if($loadingModal != null){
                    $loadingModal.modal('show');
                }
                else{
                    createLoading().modal('show');
                }
            }
            function hideLoading(){
                if($loadingModal != null){
                    $loadingModal.modal('hide');
                }
            }
            
            function feedback(msg){
                if($("#wafc_feedback").length == 0){
                    $('body').append( $(
                        '<div class="modal fade" id="wafc_feedback"> '+
                        '   <div class="modal-dialog modal-sm""> '+
                        '       <div class="modal-content"> '+
                        '           <div class="modal-header">'+
                        '               <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                        '           </div>'+
                        '           <div class="modal-body"> '+
                                        msg +
                        '           </div> '+
                        '       </div><!-- /.modal-content --> '+
                        '   </div><!-- /.modal-dialog --> '+
                        '</div><!-- /.modal -->'
                    ));
                }
                var $feedbackModal = $("#wafc_feedback");
                $feedbackModal.modal('show');
            }

        //</editor-fold>
        

        /*
         * UTILITIES
         */
        
        function getUserCoords(callback){
            if(coords === null){
                if (navigator && navigator.geolocation) {
//                    console.log("a");
                    navigator.geolocation.getCurrentPosition(
                        function(position){
//                            console.log("b");
                            //success
                            var res = { 
                                'lat': position.coords.latitude,
                                'lng': position.coords.longitude
                            };
                            callback(res);
                        },
                        function(error){
                            //error
                            window.console && console.log(error);
                            callback(null);
                        }
                    );
                } else {
//                    console.log("d");
                    callback(null);
                }
            }
            else{
                callback(coords);
            }
        }
        
        function getUserLanguage(){
            var userLang = navigator.language || navigator.userLanguage; 
//            console.log("The language is: " + userLang);
            
            switch(userLang.toLowerCase()){
                case 'it': return 'it';
                case 'it-it': return 'it';
                default: return 'en';
            }
        }

        function isNextToMe(){
            var res = $("input:radio[name=wafc_searchType]:checked").val() === 'nextToMe';
            return res;
        }
        
        function divHeight($div){
            var h = parseInt($div.height());
//            var p = parseInt($div.css('padding-bottom').replace('px', ''));
//            var res = h+p;
//            console.log("h="+h+", p="+p+", res="+res);
//            return  res;
            return h;
        }
 
        function toggleSearchTypeAnimated($divByAddress, $divByDistance){
            if(isNextToMe()){
                //save current height
                $divByAddress.attr('wafc_data-height', divHeight($divByAddress));
                //hide by address
                $divByAddress.animate({
                    'height': 0,
                    'opacity': 0
                }, 200, function(){
                    $divByAddress.hide();
                    
                    //show by distance
                    var distanceHeight = $divByDistance.attr('wafc_data-height');
                    if (distanceHeight === null) distanceHeight = 100; //default 
                    $divByDistance.parent().css('overflow', 'hidden');
                    $divByDistance.show();
                    $divByDistance.animate({
                        'height': distanceHeight,
                        'opacity': 1
                    }, 200, function(){
                        $divByDistance.parent().css('overflow', 'visible');
                    });
                });
            }
            else{
                //save current height
                $divByDistance.attr('wafc_data-height', divHeight($divByDistance));
                //hide by distance
                $divByDistance.animate({
                    'height': 0,
                    'opacity': 0
                }, 200, function(){
                    $divByDistance.hide();
                    
                    //show by address
                    var addressHeight = $divByAddress.attr('wafc_data-height');
                    if (addressHeight === null) addressHeight = 100; //default 
                    $divByAddress.parent().css('overflow', 'hidden');
                    $divByAddress.show();
                    $divByAddress.animate({
                        'height': addressHeight,
                        'opacity': 1
                    }, 200, function(){
                        $divByAddress.parent().css('overflow', 'visible');
                    });
                });
            }
        }
        
        function toggleSearchTypeInstantly($divByAddress, $divByDistance){
            if(isNextToMe()){
                //save current height
                $divByAddress.attr('wafc_data-height', divHeight($divByAddress));
                //hide by address
                $divByAddress.height(0);
                $divByAddress.css("opacity", 0);
                $divByAddress.hide();
                //show by distance
                var distanceHeight = $divByDistance.attr('wafc_data-height');
                if (distanceHeight === null) distanceHeight = 100; //default 
                $divByDistance.height(distanceHeight);
                $divByDistance.css("opacity", 1);
                $divByDistance.show();
            }
            else{
                //save current height
                $divByDistance.attr('wafc_data-height', divHeight($divByDistance));
                //hide by distance
                $divByDistance.height(0);
                $divByDistance.css("opacity", 0);
                $divByDistance.hide();
                //show by address
                var addressHeight = $divByAddress.attr('wafc_data-height');
                if (addressHeight === null) addressHeight = 100; //default 
                $divByAddress.height(addressHeight);
                $divByAddress.css("opacity", 1);
                $divByAddress.show();
            }
        }
        
        function toggleByAddressForm(animate){
            var $divByAddress = $("#wafc_byAddressForm");
            var $divByDistance = $("#wafc_byDistanceForm");
            
            if(isNextToMe()){
                //empty selection for city and denomination
                $denominationSelect.reload({
                    'idRegioneItalia':      $regionSelect.getValue(),
                    'idCategoriaTipologia': $categoryTypologySelect.getValue(),
                    'excludeCategories':    settings.excludeCategories,
                    'forceVisibilityAppExpo': settings.forceVisibilityAppExpo
                });
                $localitySelect.reload({
                    'idRegioneItalia':      $regionSelect.getValue(),
                    'idCategoriaTipologia': $categoryTypologySelect.getValue(),
                    'excludeCategories':    settings.exceludeCategories,
                    'forceVisibilityAppExpo': settings.forceVisibilityAppExpo
                });
            }
            
            if(animate){
                toggleSearchTypeAnimated($divByAddress, $divByDistance);
            }
            else{
                toggleSearchTypeInstantly($divByAddress, $divByDistance);
            }
        }
 
        /*
         * Set labels' language
         * @param {type} lang it | en
         */
        function setLanguage(lang){
            switch(lang){
                case 'it': labels = widgetTranslationIt; break;
                case 'en': labels = widgetTranslationEn; break;
            }
        }

    };
    
            
        
    /*
     * TRANSLATIONS
     */
    
    var widgetTranslationEn = {
        'denomination':   'Denomination',
        'typology':       'Typology',
        'region':         'Region',
        'province':       'Province',
        'locality':       'City',
        'nextToMe':       '"Around me" research',
        'byAddress':      'Locality based research ',
        'address':        'Address',
        'phone':          'Phone',
        'mobilePhone':    'Mobile phone',
        'representative': 'Contact person',
        'notes':          'Notes',
        'website':        'Website',
        'email':          'Email',
        'closed':         'Closing day',
        'price':          'Average cost of meal',
        'guestsOnly':     'Reserved only for guests',
        'takeAway':       'Take away service available',
        'collaborations': 'Collaborations',
        'search':         'Search',
        'directions':     'How to get there',
        'moreInfo':       'More information',
        'altreinfo_tipicucina': 'Type of cooking',
        'altreinfo_tipicitaterritorio': 'Territorial tipicality',
        'altreinfo_caratteristichecucina': 'Cooking characteristics',
        'altreinfo_pizza': 'Pizza',
        'altreinfo_dedicato': 'Particularly dedicated to',
        'altreinfo_orariapertura': 'Opening time',
        'altreinfo_chiusuraferie': 'Closed for holidays',
        'numeroCoperti': 'Seating capacity',
        'altreinfo_numerocopertisalainterna': 'Interior restaurant/pizzeria room places',
        'altreinfo_numerocopertisalaricevimento': 'Salon seating capacity',
        'altreinfo_numerocopertidehor': 'Dehor seating capacity',
        'altreinfo_numerocamere': 'Number of rooms',
        'altreinfo_intolleranze': 'Food intolerances / Food allergies friendly Cooking',
        'piattiIdoneiPer': 'Dishes suitable also for',
        'altreinfo_guideristorazione': 'You can find us also on',
        'altreinfo_menu': 'Menu',
        'altreinfo_materieprime': 'Raw materials / Ingredients',
        'inMenuPresente': 'In the menu',
        'altreinfo_propostedisponibili': 'Culinary proposals',
        'altreinfo_menubambini': 'Kids menu',
        'altreinfo_birrasenzaglutine': 'Gluten free beer',
        'altreinfo_prezzopietanzesguguale': 'Gluten free prices equal to conventional',
        'altreinfo_prezzopizzesguguale': 'Gluten free pizza prices equal to conventional',
        'altreinfo_servizi': 'Services / Facilities',
        'altreinfo_vegetariani': 'Vegetarians',
        'altreinfo_vegani': 'Vegans',
        'yes': 'Yes',
        'no': 'No',
        'exportAll': 'Give all results',
        'structures': 'Venues',
        'structure': 'Venue',
        'altreinfo_prenotazioneobbligatoria': 'Reservation required',
        'resultsNumber': 'Number of results: ',
        'loading': 'Loading',
        'schedaLocale': 'Get more info on this venue',
        'esporta': 'Print',
        'distanzaMassima': 'Not more distant than… (Km)',
        'noCoordinateUtente': "impossible to identify user's position"
    };
    
    var widgetTranslationIt = {
        'denomination':   'Denominazione',
        'typology':       'Tipologia',
        'region':         'Regione',
        'province':       'Provincia',
        'locality':       'Città',
        'nextToMe':       'Vicino a me',
        'byAddress':      'Ricerca per localit&agrave;',
        'address':        'Indirizzo',
        'phone':          'Telefono',
        'mobilePhone':    'Cellulare',
        'representative': 'Referente',
        'notes':          'Note',
        'website':        'Sito web',
        'email':          'Email',
        'closed':         'Chiusura settimanale',
        'guestsOnly':     'Ristorazione riservata ai soli ospiti',
        'takeAway':       "Servizio d'asporto disponibile",
        'price':          'Costo medio pasto',
        'collaborations': 'Collaborazioni',
        'search':         'Cerca',
        'directions':     'Come arrivare',
        'moreInfo':       'Maggiori informazioni',
        'altreinfo_tipicucina': 'Tipo di cucina',
        'altreinfo_tipicitaterritorio': 'Tipicità legata al territorio',
        'altreinfo_caratteristichecucina': 'Caratteristica della cucina',
        'altreinfo_pizza': 'Pizza',
        'altreinfo_dedicato': 'Particolarmente dedicato a',
        'altreinfo_orariapertura': 'Orari di apertura',
        'altreinfo_chiusuraferie': 'Periodo chiusura per ferie',
        'numeroCoperti': 'Numero coperti',
        'altreinfo_numerocopertisalainterna': 'Coperti sala interna ristorante/pizzeria',
        'altreinfo_numerocopertisalaricevimento': 'Coperti sala ricevimento',
        'altreinfo_numerocopertidehor': 'Coperti dehor',
        'altreinfo_numerocamere': 'Numero di camere',
        'altreinfo_intolleranze': 'Cucina anche per intolleranti/allergici a',
        'piattiIdoneiPer': 'Piatti idonei anche per',
        'altreinfo_guideristorazione': 'Locale inserito nella guida',
        'altreinfo_menu': 'Menù',
        'altreinfo_materieprime': 'Materie prime',
        'inMenuPresente': 'Nel menù è presente',
        'altreinfo_propostedisponibili': 'Alcune proposte culinarie',
        'altreinfo_menubambini': 'Menù bambini',
        'altreinfo_birrasenzaglutine': 'Birra senza glutine',
        'altreinfo_prezzopietanzesguguale': 'Prezzi delle pietanze senza glutine uguali alle convenzionali',
        'altreinfo_prezzopizzesguguale': 'Prezzi delle pizze senza glutine uguali alle convenzionali',
        'altreinfo_servizi': 'Servizi',
        'altreinfo_vegetariani': 'Vegetariani',
        'altreinfo_vegani': 'Vegani',
        'yes': 'Sì',
        'no': 'No',
        'exportAll': 'Esporta tutti i risultati',
        'structures': 'Strutture',
        'structure': 'Struttura',
        'altreinfo_prenotazioneobbligatoria': 'Prenotazione obbligatoria',
        'resultsNumber': 'Numero di risultati: ',
        'loading': 'Caricamento',
        'schedaLocale': 'Scheda locale',
        'esporta': 'Esporta',
        'distanzaMassima': 'Distanza massima (Km)',
        'noCoordinateUtente': "Impossibile identificare la posizione dell'utente"
    };
    
    var datatableIt = {
        'sEmptyTable':     "Nessun dato presente nella tabella",
        'sInfo':           "Vista da _START_ a _END_ di _TOTAL_ elementi",
        'sInfoEmpty':      "Vista da 0 a 0 di 0 elementi",
        'sInfoFiltered':   "(filtrati da _MAX_ elementi totali)",
        'sInfoPostFix':    "",
        'sInfoThousands':  ",",
        'sLengthMenu':     "Visualizza _MENU_ elementi",
        'sLoadingRecords': "Caricamento...",
        'sProcessing':     "Elaborazione...",
        'sSearch':         "Cerca:",
        'sZeroRecords':    "La ricerca non ha portato alcun risultato.",
        'oPaginate': {
            'sFirst':      "Inizio",
            'sPrevious':   "Precedente",
            'sNext':       "Successivo",
            'sLast':       "Fine"
        },
        'oAria': {
            'sSortAscending':  ": attiva per ordinare la colonna in ordine crescente",
            'sSortDescending': ": attiva per ordinare la colonna in ordine decrescente"
        }
    };
 
}( jQuery ));

// https://css-tricks.com/snippets/jquery/smooth-scrolling/
(function ( $ ) {
    $.fn.smoothlyScrollToMe = function() {
        $('html,body').animate({
//            scrollTop: this.offset().top
            scrollTop: this.get(0).offsetTop
        }, 500);
        return false;
    };
}( jQuery ));
