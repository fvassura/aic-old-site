function wafcSelect(name, label, json, jsonLabel, jsonValue, isHidden, defaultVal, isAutocomplete, initData, renderOptionFunction, renderItemFunction){
    // info
    this.name = name;
    this.id = "#"+this.name;
    this.label = label;
    this.json = json;
    this.jsonLabel = jsonLabel;
    this.jsonValue = jsonValue;
    this.isHidden = isHidden;
    this.defaultVal = defaultVal;
    this.isAutocomplete = isAutocomplete;
    this.initData = initData;
       
    //listeners
    this.changeListeners = Array();
    
    //state
    this.oldSelectedValue;
    this.isLoading = 0;
    
    
    
    /*
     * CUSTOM RENDERING FUNCTIONS
     */
    this.initializeRenderOptionFunction = function(func){
        var outer = this;
        
        if(func != null && typeof(func)=='function'){
            this.renderOptionFunction = func;
        }
        else{
            this.renderOptionFunction = function(item, escape) {
                var cl = '';
                if (item[outer.jsonValue] === "") cl = 'wafc_placeholder';
                return '<div data-value="'+escape(item[outer.jsonValue])+'" data-selectable="" class="option '+cl+'">'+escape(item[outer.jsonLabel])+'</div>';
            };
        }
    };
    
    this.initializeRenderItemFunction = function(func){
        var outer = this;
        
        if(func != null && typeof(func)=='function'){
            this.renderItemFunction = func;
        }
        else{
            this.renderItemFunction = function(item, escape) {
                var cl = '';
                if (item[outer.jsonValue] === "") cl = 'wafc_placeholder';
                return '<div class="item '+cl+'">' + escape(item[outer.jsonLabel]) + '</div>';
            };
        }
    };
    this.initializeRenderOptionFunction(renderOptionFunction);
    this.initializeRenderItemFunction(renderItemFunction);
    
    this.createInDom = function($div, labels){
        var $selectContainer = null;
        
        if(!this.isAutocomplete){
            $selectContainer = $div.append(
                '<div class="selectizedContainer">'+
                '   <select id="'+this.name+'" class="wafc_form_element" name="'+this.name+'" ></select>'+
                '</div>'
            );
        }
        else{
            $selectContainer = $div.append(
                '<div class="selectizedContainer">'+
                '   <input type="text" id="'+this.name+'" class="wafc_form_element"  name="'+this.name+'" />'+
                '</div>'
            );
        }
        
        this.selectizeMe();
        if(this.isHidden === true){
            $(this.id).parents(".selectizedContainer").addClass('wafc_hidden');
        }
        
        //load init data
        this.reload(this.initData);

        return this;
    };
   
    
    this.reload = function(data){
        var $select = $(this.id);
        var outer = this;
        this.isLoading++;
        this.saveOldSelectedValue();
        
        var selectize = $select[0].selectize;
        selectize.clear();
        selectize.clearOptions();
        selectize.load(function(callback) {
            $.ajax({
                'url': outer.json,
                'type': 'GET',
                'dataType': 'jsonp',
                'data': data,
                error: function() {
                    callback();
                },
                success: function(res) {
                    if(outer.defaultVal === null){
                        res = outer.addEmptyOption(res);
                    }
                    callback(res);
                }
            });
        });
    };

    this.createEmptyOption = function(){
        var empty = {};
        empty[this.jsonLabel] = label;
        empty[this.jsonValue] = "";
        empty["sort"] = 0;
        return empty;
    };
    
    this.addEmptyOption = function(res){
        res.unshift(this.createEmptyOption());

        for(var i=0; i<res.length; i++){
            res[i].sort = i+1;
        }
        return res;
    };

    this.selectizeMe = function(){
        var $select = $(this.id);
        var outer = this;
        
        $select.selectize({
            'valueField': this.jsonValue,
            'labelField': this.jsonLabel,
            'searchField': this.jsonLabel,
            'sortField': "sort",
            'maxItems': 1,
            'render': {
                'option': outer.renderOptionFunction,
                'item': outer.renderItemFunction
            }
        });
        
        if(this.isAutocomplete){
            //grafica da autocomplete
            $select.next('.selectize-control').removeClass('single');
        }
        
        var selectize = $select[0].selectize;
        //when data is loaded
        selectize.on('load', function(){
//            console.log("load "+outer.id);
            if(outer.defaultVal !== null){
                selectize.setValue(outer.defaultVal);
            }
            else{
                outer.restoreOldSelectedValue();
                outer.isLoading--;
            }

        });
        
        //if blur on indeterminate state, set null value
        $select.parent().find('.selectize-input input').on('blur', function() {
            if(outer.isInIndeterminateState()){
                var $select = $(outer.id);
                var selectize = $select[0].selectize;
                selectize.setValue("");
            }
        });
        
        //if focus and value set is empty, delete text (=> bring to indeterminate state)
        $select.parent().find('.selectize-input input').on('focus', function() {
            var $select = $(outer.id);
            if(selectize.getValue() === ""){
                $select.parent().find(".selectize-input div").first().html("");
                selectize.clear();
            }
        });
        
        //when value changes, notify listeners
        $select.change(function(value){
            if(outer.isInIndeterminateState()){
//                console.log(outer.id + " IND");
                return;
            }
//            console.log(outer.id + " (DET) has changed: isLoading = "+outer.isLoading);
            
            //what happens during loading stays in loading
            if (outer.isLoading !== 0) return;
            
            var id = outer.id;
            for(var i=0; i<outer.changeListeners.length; i++){
                outer.changeListeners[i].onRelatedSelectValueChanged(id, value);
            }
        });
        
    };

    this.addChangeListener = function(listener){
        this.changeListeners.push(listener);
    };
    
    this.onRelatedSelectValueChanged = function(id, value){
        //to be overridden
    };
    
    this.saveOldSelectedValue = function(){
        var val = $(this.id).val();
        
        if(val === "") this.oldSelectedValue = null;
        else this.oldSelectedValue = val;
    };
    
    this.restoreOldSelectedValue = function(){
        var $select = $(this.id);
        var selectize = $select[0].selectize;
        
        if(this.oldSelectedValue !== null && typeof(this.oldSelectedValue) != "undefined"){
//            console.log(this.id+": try to restore "+this.oldSelectedValue);
            selectize.setValue(this.oldSelectedValue); //try to keep the old selected value, if applicable
            //if not applicable should set to ""
            if($select.val() !== this.oldSelectedValue){
                selectize.setValue("");
            }
        }
        else{
            selectize.setValue("");
        }
    };
    
//    this.setValue = function(val){
//        var $select = $(this.id);
//        var selectize = $select[0].selectize;
//        
//        selectize.setValue(val);
//    };

    this.getValue = function(){
        if(this.isHidden) return this.defaultVal;
        return $(this.id).val();
    };
    
    /**
     * Checks if the select has a value set, whether it is a real value or "empty"
     * @returns true if the select has a value or is empty, false otherwise (i.e. no text written in the combo, no value selected)
     */
    this.isInIndeterminateState = function(){
        var $select = $(this.id);
        
        if(this.getValue() !== null && this.getValue() !== "") return false; //real value selected
        
        //might be indeterminate
        var res = 
            typeof($select.parent().find(".selectize-input div").first().html()) === "undefined"
            ||
            $select.parent().find(".selectize-input div").first().html()=== "";
//        console.log($select.parent().find(".selectize-input div").first().html() + " => "+res);
        return res;
    };
}