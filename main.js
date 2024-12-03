// Khởi tạo overlay để hiển thị popup tọa độ
var container = document.getElementById("popup");
var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

// Thiết lập tâm và mức zoom ban đầu
var center = [564429.04, 2317738.2];
var zoom = 0;

// Định nghĩa hệ tọa độ và view của bản đồ
var projection = new ol.proj.Projection({
  code: "EPSG:3405",
  units: "m",
});

var view = new ol.View({
  projection: projection,
  center: center,
  zoom: zoom,
});

// Tạo các lớp bản đồ
var vung = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: "http://localhost:8080/geoserver/BacNinh/wms",
    params: {
      FORMAT: "image/png",
      LAYERS: "BacNinh:bacninh_xp",
    },
  }),
});

var qh = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: "http://localhost:8080/geoserver/BacNinh/wms",
    params: {
      FORMAT: "image/png",
      LAYERS: "BacNinh:bacninh_qh",
    },
  }),
});

var duong = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: "http://localhost:8080/geoserver/BacNinh/wms",
    params: {
      FORMAT: "image/png",
      LAYERS: "BacNinh:roads",
    },
  }),
});

var truong = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: "http://localhost:8080/geoserver/BacNinh/wms",
    params: {
      FORMAT: "image/png",
      LAYERS: "BacNinh:schoolBacNinh",
    },
  }),
});

var atm = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: "http://localhost:8080/geoserver/BacNinh/wms",
    params: {
      FORMAT: "image/png",
      LAYERS: "BacNinh:atmBacNinh",
    },
  }),
});

var benhvien = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: "http://localhost:8080/geoserver/BacNinh/wms",
    params: {
      FORMAT: "image/png",
      LAYERS: "BacNinh:hospitalBacNinh",
    },
  }),
});

// Khởi tạo bản đồ với các lớp
var map = new ol.Map({
  target: "map",
  layers: [vung, qh, duong, truong, atm, benhvien],
  overlays: [overlay],
  view: view,
});

// Điều chỉnh bật/tắt lớp bản đồ
$("#checkvung").change(function () {
  vung.setVisible($("#checkvung").is(":checked"));
});
$("#checkqh").change(function () {
  qh.setVisible($("#checkqh").is(":checked"));
});
$("#checkduong").change(function () {
  duong.setVisible($("#checkduong").is(":checked"));
});
$("#checktruong").change(function () {
  truong.setVisible($("#checktruong").is(":checked"));
});
$("#checkatm").change(function () {
  atm.setVisible($("#checkatm").is(":checked"));
});
$("#checkbenhvien").change(function () {
  benhvien.setVisible($("#checkbenhvien").is(":checked"));
});

// Hiển thị các trường
function hienThiTatCaTruong() {
  truong.setVisible(true);
  showResult("Đã hiển thị tất cả các trường.");
}

// Hiển thị các ATM
function hienThiTatCaATM() {
  atm.setVisible(true);
  showResult("Đã hiển thị tất cả các ATM.");
}

// Hiển thị các bệnh viện
function hienThiTatCaBenhVien() {
  benhvien.setVisible(true);
  showResult("Đã hiển thị tất cả các bệnh viện.");
}

// Hàm nâng cao: Tìm các trường học trong huyện theo tên nhập
function timTruongTheoHuyen() {
  const districtNameInput = document.getElementById("district-input").value.trim();

  if (!districtNameInput) {
    showResult("Vui lòng nhập tên huyện cần tìm!");
    return;
  }

  const url =
    "http://localhost:8080/geoserver/BacNinh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=BacNinh:schoolBacNinh&outputFormat=application/json";

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.features || data.features.length === 0) {
        throw new Error("Không tìm thấy dữ liệu.");
      }

      const schools = data.features.filter((feature) => {
        const district = feature.properties.VARNAME_2 || "";
        return district.toLowerCase().includes(districtNameInput.toLowerCase());
      });

      if (schools.length) {
        const list = schools.map((school) => `<li>${school.properties.tên}</li>`).join("");
        showResult(`Danh sách trường học có tên "${districtNameInput}":<ul>${list}</ul>`);
      } else {
        showResult(`Không có trường nào có tên "${districtNameInput}".`);
      }
    })
    .catch((error) => {
      showResult("Không thể lấy dữ liệu từ máy chủ.");
      console.error(error);
    });
}

// Hàm nâng cao: Tìm huyện lớn nhất
function timHuyenLonNhat() {
  const url =
    "http://localhost:8080/geoserver/BacNinh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=BacNinh:bacninh_qh&outputFormat=application/json";

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      let maxArea = 0;
      let largestDistrict = null;

      data.features.forEach((feature) => {
        const area = feature.properties.area || 0;
        if (area > maxArea) {
          maxArea = area;
          largestDistrict = feature.properties.NAME_2;
        }
      });

      if (largestDistrict) {
        showResult(`Huyện lớn nhất tỉnh Bắc Ninh là: <strong>${largestDistrict}</strong> `);
      } else {
        showResult("Không tìm thấy thông tin về huyện lớn nhất.");
      }
    })
    .catch((error) => {
      showResult("Không thể lấy dữ liệu từ máy chủ.");
      console.error(error);
    });
}

// Hàm nâng cao: Tìm trường học gần bệnh viện
function timTruongGanBenhVien() {
  const schoolUrl =
    "http://localhost:8080/geoserver/BacNinh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=BacNinh:schoolBacNinh&outputFormat=application/json";

  const hospitalUrl =
    "http://localhost:8080/geoserver/BacNinh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=BacNinh:hospitalBacNinh&outputFormat=application/json";

  Promise.all([fetch(schoolUrl), fetch(hospitalUrl)])
    .then(([schoolRes, hospitalRes]) => {
      if (!schoolRes.ok || !hospitalRes.ok) {
        throw new Error("Lỗi khi tải dữ liệu từ máy chủ.");
      }
      return Promise.all([schoolRes.json(), hospitalRes.json()]);
    })
    .then(([schoolData, hospitalData]) => {
      if (!schoolData.features.length || !hospitalData.features.length) {
        throw new Error("Không có dữ liệu trường học hoặc bệnh viện.");
      }

      let results = [];

      hospitalData.features.forEach((hospital) => {
        const hospitalCoords = hospital.geometry.coordinates;
        let closestSchool = null;
        let minDistance = Infinity;

        schoolData.features.forEach((school) => {
          const schoolCoords = school.geometry.coordinates;
          const distance = calculateDistance(
            hospitalCoords[0],
            hospitalCoords[1],
            schoolCoords[0],
            schoolCoords[1]
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestSchool = school.properties.tên;
          }
        });

        results.push({
          hospital: hospital.properties.tên,
          school: closestSchool,
          distance: (minDistance / 1000).toFixed(2), // Convert to km
        });
      });

      const resultList = results
        .map(
          (result) =>
            `<li>Bệnh viện: <strong>${result.hospital}</strong> - Trường gần nhất: <strong>${result.school}</strong> (${result.distance} km)</li>`
        )
        .join("");
      showResult(`Danh sách trường học gần bệnh viện:<ul>${resultList}</ul>`);
    })
    .catch((error) => {
      showResult("Lỗi khi tính toán khoảng cách.");
      console.error(error);
    });
}

// Hàm tính khoảng cách giữa hai tọa độ
function calculateDistance(lon1, lat1, lon2, lat2) {
  const R = 6371e3; // Bán kính Trái đất (mét)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách theo mét
}
// Bắt sự kiện click vào bản đồ
map.on("singleclick", function (event) {
  const viewResolution = view.getResolution();
  const url = qh
    .getSource()
    .getFeatureInfoUrl(event.coordinate, viewResolution, view.getProjection(), {
      INFO_FORMAT: "application/json",
    });

  if (url) {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Không thể lấy thông tin từ máy chủ.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.features && data.features.length > 0) {
          // Lấy tên huyện từ thuộc tính (ví dụ: "NAME_2" hoặc trường tương ứng)
          const districtName = data.features[0].properties.NAME_2 || "Không xác định";
          showResult(`Huyện: <strong>${districtName}</strong>`);
        } else {
          showResult("Không tìm thấy thông tin huyện tại vị trí đã chọn.");
        }
      })
      .catch((error) => {
        console.error(error);
        showResult("Lỗi khi truy vấn thông tin huyện.");
      });
  } else {
    showResult("Không thể tạo URL truy vấn thông tin.");
  }


  const coords = ol.proj.toLonLat(event.coordinate, projection); // Chuyển đổi sang tọa độ địa lý
  const lon = coords[0].toFixed(6);
  const lat = coords[1].toFixed(6);

  const content = document.getElementById("popup-content");
  content.innerHTML = `<p><strong>Tọa độ:</strong><br> Kinh độ: ${lon}<br> Vĩ độ: ${lat}</p>`;
  overlay.setPosition(event.coordinate); // Đặt vị trí của popup tại nơi click
});

// Hàm hiển thị kết quả trong ô thông báo
function showResult(message) {
  const resultBox = document.getElementById("result-box");
  if (resultBox) {
    resultBox.innerHTML = `<div class="alert alert-info" role="alert">${message}</div>`;
  } else {
    alert(message);
  }
}


