import { Modal, Button as BootstrapButton } from "react-bootstrap";
import { Herramienta, ModelosHerramienta, Ubicaciones } from "../../../models";
import { useEffect, useState } from "react";

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  toolTemp: Herramienta | null;
  setToolTemp: (tool: Herramienta) => void;
  modelos?: Array<ModelosHerramienta>; 
  ubicaciones?: Array<Ubicaciones>; 
  setImage: (file: File | null) => void;
  editingToolIndex: number | null;
}

const HerramientaModal = ({
  show,
  onClose,
  onSave,
  toolTemp,
  setToolTemp,
  modelos = [],
  ubicaciones = [],
  setImage,
  editingToolIndex,
}: Props) => {
  const [localTool, setLocalTool] = useState<Herramienta | null>(null);

  useEffect(() => {
    setLocalTool(toolTemp);
  }, [toolTemp]);

  const handleChange = (key: keyof Herramienta, value: any) => {
    if (!localTool) return;
    const updatedTool = { ...localTool, [key]: value };
    setLocalTool(updatedTool);
    setToolTemp(updatedTool);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {editingToolIndex !== null ? "Editar Herramienta" : "Agregar Herramienta"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-2 gap-4">
          <input
            value={localTool?.nombre || ""}
            placeholder="Nombre"
            onChange={(e) => handleChange("nombre", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            value={localTool?.codigo || ""}
            placeholder="Código"
            onChange={(e) => handleChange("codigo", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            value={localTool?.descripcion || ""}
            placeholder="Descripción"
            onChange={(e) => handleChange("descripcion", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            value={localTool?.serie || ""}
            placeholder="Serie"
            onChange={(e) => handleChange("serie", e.target.value)}
            className="p-2 border rounded"
          />
          <select
            value={localTool?.modelo || ""}
            onChange={(e) => handleChange("modelo", e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Seleccione un modelo</option>
            {modelos.map((m) => (
              <option key={m.id} value={m.nombre}>
                {m.nombre}
              </option>
            ))}
          </select>
          <input
            value={localTool?.marca || ""}
            placeholder="Marca"
            onChange={(e) => handleChange("marca", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            value={localTool?.NParte || ""}
            placeholder="N° Parte"
            onChange={(e) => handleChange("NParte", e.target.value)}
            className="p-2 border rounded"
          />
          <select
            value={localTool?.ubicacion || ""}
            onChange={(e) => handleChange("ubicacion", e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Seleccione ubicación</option>
            {ubicaciones.map((u) => (
              <option key={u.id} value={u.nombre}>
                {u.nombre}
              </option>
            ))}
          </select>
          <select
            value={localTool?.estado || ""}
            onChange={(e) => handleChange("estado", e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Seleccione estado</option>
            <option value="Disponible">Disponible</option>
            <option value="En uso">En uso</option>
          </select>
          <select
            value={localTool?.calibracion || ""}
            onChange={(e) => handleChange("calibracion", e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Seleccione Calibración</option>
            <option value="Calibrada">Calibrada</option>
            <option value="No calibrada">No calibrada</option>
            <option value="No necesita">No necesita</option>
          </select>
          <input
            value={localTool?.tipo || ""}
            placeholder="Tipo"
            onChange={(e) => handleChange("tipo", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            value={localTool?.observacion || ""}
            placeholder="Observación"
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="p-2 border rounded"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <BootstrapButton variant="secondary" onClick={onClose}>
          Cerrar
        </BootstrapButton>
        <BootstrapButton
          variant="primary"
          onClick={() => {
            onSave();
            onClose();
          }}
        >
          {editingToolIndex !== null ? "Guardar edición" : "Agregar herramienta"}
        </BootstrapButton>
      </Modal.Footer>
    </Modal>
  );
};

export default HerramientaModal;
