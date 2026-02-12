// import Papa from "papaparse";

// export function parseDoctorCSVFromURL(url) {
//   return new Promise((resolve, reject) => {
//     Papa.parse(url, {
//       download: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         if (!results.data || results.data.length === 0) {
//           resolve([]);
//           return;
//         }

//         // 🔍 Detect delimiter
//         const firstRow = results.data[0][0] || "";
//         let delimiter = ",";
//         if (firstRow.includes(";")) delimiter = ";";
//         else if (firstRow.includes("\t")) delimiter = "\t";
//         else if (firstRow.includes("|")) delimiter = "|";

//         // 🔁 Re-parse with headers
//         Papa.parse(url, {
//           download: true,
//           header: true,
//           skipEmptyLines: true,
//           delimiter,
//           complete: (res) => {
//             const doctorMap = {};

//             res.data.forEach((row) => {
//               if (!row.name) return;

//               const key = row.name.trim().toLowerCase();

//               // 🆕 Create doctor only once
//               if (!doctorMap[key]) {
//                 doctorMap[key] = {
//                   id: key.replace(/[^a-z0-9]+/g, "-"),
//                   name: row.name,
//                   speciality: row.focus_area || row.speciality || "",
//                   hospital: row.clinic_name || "Clinic",
//                   address1: row.address1 || "",
//                   latitude: row.latitude || null,
//                   longitude: row.longitude || null,
//                   consultationFee: Number(row.Rokka) || 0,
//                   experience: row.experience || "",
//                   about: row.discription || "",
//                   photoUrl: row.profile_url || "/dboss.jpg",

//                   // 🔥 VERY IMPORTANT
//                   consultationRows: []
//                 };
//               }

//               // 🔥 Push every row → slot capacity
//               doctorMap[key].consultationRows.push(row);
//             });

//             const doctors = Object.values(doctorMap);

//             console.log("PARSED DOCTORS:", doctors.length);
//             console.log("SAMPLE DOCTOR:", doctors[0]);

//             resolve(doctors);
//           },
//           error: reject
//         });
//       },
//       error: reject
//     });
//   });
// }
