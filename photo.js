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