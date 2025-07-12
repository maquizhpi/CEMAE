import React, { useEffect, useState } from "react";
import { Herramienta } from "../../../../models";
import { Button } from "react-bootstrap";

export interface Props {
  visible: boolean;
  close: () => Promise<void>;
  initialData: Herramienta | null;
  onDone: (tool: Herramienta) => Promise<void>;
}

const HerramientaModal = ({ visible, close, initialData, onDone }: Props) => {
  const [formData, setFormData] = useState<Herramienta>(
    initialData || {
      _id: "",
      nombre: "",
      codigo: "",
      descripcion: "",
      serie: "",
      modelo: "",
      marca: "",
      NParte: "",
      ubicacion: "",
      estado: "",
      calibracion: "",
      tipo: "",
      cantidad: 1,
      observacion: "",
      imagen: "",
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await onDone(formData);
    await close();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold text-blue-600 mb-4">
          {initialData ? "Editar Herramienta" : "Nueva Herramienta"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            placeholder="Código"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="serie"
            value={formData.serie}
            onChange={handleChange}
            placeholder="Serie"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            placeholder="Modelo"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            placeholder="Marca"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="NParte"
            value={formData.NParte}
            onChange={handleChange}
            placeholder="N° Parte"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Ubicación"
            className="p-2 border rounded"
          />
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Seleccione Estado</option>
            <option value="Disponible">Disponible</option>
            <option value="En uso">En uso</option>
          </select>
          <select
            name="calibracion"
            value={formData.calibracion}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Seleccione Calibración</option>
            <option value="Calibrada">Calibrada</option>
            <option value="No calibrada">No calibrada</option>
            <option value="No necesita">No necesita</option>
          </select>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Seleccione Tipo</option>
            <option value="Presicion">Presición</option>
            <option value="Manual">Manual</option>
            <option value="Especial">Especial</option>
            <option value="Equipo y maquinas">Equipo y Máquinas</option>
          </select>
          <input
            type="text"
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            placeholder="Observación"
            className="p-2 border rounded"
          />
        </div>

        <div className="flex justify-between space-x-4">
          <Button onClick={handleSubmit} className="bg-blue-600 text-white w-full">
            {initialData ? "Actualizar" : "Guardar"}
          </Button>
          <Button onClick={close} variant="secondary" className="w-full">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HerramientaModal;
