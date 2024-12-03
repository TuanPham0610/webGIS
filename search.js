// Lấy các đối tượng layer từ bản đồ
var layers = [vung, duong, diem];

// Lặp qua từng layer để thêm sự kiện click vào từng đối tượng
layers.forEach(function(layer) {
    layer.on('click', function(evt) {
        var feature = evt.feature;
        var properties = feature.getProperties();
        
        // Tạo nội dung thông tin từ các thuộc tính của đối tượng
        var content = '<h4>Thông tin</h4><ul>';
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                content += '<li><strong>' + property + ':</strong> ' + properties[property] + '</li>';
            }
        }
        content += '</ul>';
        
        // Hiển thị nội dung trong phần tử có class "show_infor"
        document.querySelector('.show_infor').innerHTML = content;
    });
});
