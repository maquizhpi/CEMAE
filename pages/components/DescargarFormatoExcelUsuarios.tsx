import * as XLSX from "xlsx";

export default function DescargarFormatoExcelUsuarios() {
  const handleDownload = () => {
    const data = [
      [
        "Nombre",
        "Identificación",
        "Usuario",
        "Contraseña",
        "Correo",
        "Teléfono",
        "Estado",
        "Rol"
      ],
      [
        "Juan Perez",
        "0102030405",
        "jperez",
        "Password123!",
        "jperez@example.com",
        "0987654321",
        "Activo",
        "Cliente"
      ],
      [
        "Maria Lopez",
        "1102030406",
        "mlopez",
        "Password123!",
        "mlopez@example.com",
        "0998877665",
        "Activo",
        "Cliente"
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

    XLSX.writeFile(workbook, "Formato_Usuarios.xlsx");
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg mt-4"
    >
      Descargar Formato Usuarios
    </button>
  );
}
