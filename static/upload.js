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
        if($("#txtFileUpload").prop('files')[0]){
            let file = $("#txtFileUpload").prop('files')[0];
            upload(file, params);
        }
        else if($("#defaultData").val()){
            $.ajax({
                type: "POST",
                url: '/defaultdata',
                data: JSON.stringify(params),
                contentType: 'application/json',
                success: function (response) {
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
                        test = {data: results.data};
                        var dataObj = Object.assign(test, parameters);
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
                        console.log(response);
                        console.log('upload successful!\n');
                        tree.create(response)
                    }
                 })//close
                }
            });
        }
    }
});
