$(document).ready(function() {
    var tree = new Tree();
    // The event listener for the file upload
    // document.getElementById('txtFileUpload').addEventListener('change', upload, false);
    // document.getElementById('defaultData').addEventListener('change', defaultData, false);
    document.getElementById('submitParams').addEventListener('click', defaultData , false);

    function defaultData() {
        // console.log($("#defaultData").val());
        let depth = $("#depthVal").val();
        let minSampleSplit = $("#minSampleSplit").val();
        let params = {"depth": depth, "minSampleSplit": minSampleSplit};
        let n_estimators = $("#n_estimators");
        if(n_estimators.length){
            params["n_estimators"] = n_estimators.val();
        }
        if($("#txtFileUpload").prop('files')[0]){
            let file = $("#txtFileUpload").prop('files')[0];
            upload(file, params);
        }
        else if($("#defaultData").val()){
            // hard-code range values and labels and label-count for default data
            // for new data calculate the values and store them in window
            window.rangeValues = {"sepal length (cm)":{"min": 4.3, "max":7.9},
            "sepal width (cm)": {"min": 2, "max":4.4},
            "petal length (cm)": {"min": 1, "max":6.9},
            "petal width (cm)": {"min": 0.1, "max":2.5}};
            window.labelCount = {"setosa": 56, "versicolor": 55, "virginica": 55};
            window.labels = ["setosa", "versicolor", "virginica"];
            $.ajax({
                type: "POST",
                url: '/defaultdata',
                data: JSON.stringify(params),
                contentType: 'application/json',
                success: function (response) {
                    // console.log(response)
                        tree.create(response)
                }
             })//close
        }
    }
    
    // Method that checks that the browser supports the HTML5 File API
    function browserSupportFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            isCompatible = true;
        }
        return isCompatible;
    }

    // Method that reads and processes the selected file
    function upload(file, parameters) {
        if (!browserSupportFileUpload()) {
            alert('The File APIs are not fully supported in this browser!');
        } else {
            // var data = null;
            // var file = file;
            var data = Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    // console.log("Dataframe:", JSON.stringify(results.data));
                    console.log("Column names:", results.meta.fields);
                    console.log("Errors:", results.errors);
                    if (results.data && results.data.length > 0) {
                        // alert('Imported -' + results.data.length + '- rows successfully!');
                        $("#defaultData").prop("selectedIndex", 0); //reset default selection
                        // var keys = []; // collect all keys
                        // for (let key in results.data[0]) {
                        //     // check if the property/key is defined in the object itself, not in parent
                        //     if (results.data[0].hasOwnProperty(key)) {
                        //         keys.push(key);
                        //     }
                        // }
                        var keys = results.meta.fields;
                        var rangeValues = {}; // for each key min and max values
                        keys.forEach((key) => {
                            if(key.toLowerCase() === 'label'){
                                return;
                            }
                            let min = Math.min(...(results.data).map(item => item[key]));
                            let max = Math.max(...(results.data).map(item => item[key]));
                            rangeValues[key] = {'min':min, 'max':max}
                            // rangeValues.push({'key': key,'range':{'min':min, 'max':max}});
                        });
                        let labelColumn = [...(results.data).map(item => item['label'])];
                        let labels = [...new Set((results.data).map(item => item['label']))];

                        let labelCount = {};
                        for (let i = 0; i < labelColumn.length; i++) {
                            labelCount[labelColumn[i]] = 1 +
                                (labelCount[labelColumn[i]] || 0);
                        }
                        // console.log(rangeValues);
                        console.log(labelCount);
                        window.rangeValues = rangeValues;
                        window.labels = labels;
                        window.labelCount = labelCount;


                        var dataset = {data: results.data};
                        var dataObj = Object.assign(dataset, parameters);
                        // console.log(dataset);
                    } else {
                        alert('No data to import!');
                    }
                 $.ajax({
                    type: "POST",
                    url: '/learning',
                   data: JSON.stringify(dataObj),
                   //  data: test,
                    contentType: 'application/json',
                    success: function (response) {
                        // alert(response.status);
                        // console.log(response);
                        console.log('upload successful!\n');
                        tree.create(response)
                    }
                 })//close
                }
            });
        }
    }
});
