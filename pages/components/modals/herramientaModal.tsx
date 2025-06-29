import { Modal, Button as BootstrapButton } from "react-bootstrap";
import { Herramienta, ModelosHerramienta, Ubicaciones } from "../../models";

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  toolTemp: Herramienta;
  setToolTemp: (tool: Herramienta) => void;
  modelos: Array<ModelosHerramienta>;
  ubicaciones: Array<Ubicaciones>;
  setImage: (file: File | null) => void;
  editingToolIndex: number | null;
}

const HerramientaModal = ({
  show,
  onClose,
  onSave,
  toolTemp,
  setToolTemp,
  modelos,
  ubicaciones,
  setImage,
  editingToolIndex,
}: Props) => {
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
            value={toolTemp.nombre}
            placeholder="Nombre"
            onChange={(e) => setToolTemp({ ...toolTemp, nombre: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            value={toolTemp.codigo}
            placeholder="Código"
            onChange={(e) => setToolTemp({ ...toolTemp, codigo: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            value={toolTemp.descripcion}
            placeholder="Descripción"
            onChange={(e) => setToolTemp({ ...toolTemp, descripcion: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            value={toolTemp.serie}
            placeholder="Serie"
            onChange={(e) => setToolTemp({ ...toolTemp, serie: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={toolTemp.modelo}
            onChange={(e) => setToolTemp({ ...toolTemp, modelo: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Seleccione una Marca</option>
            {modelos.map((m) => (
              <option key={m.id} value={m.nombre}>
                {m.nombre}
              </option>
            ))}
          </select>
          <input
            value={toolTemp.marca}
            placeholder="Modelo"
            onChange={(e) => setToolTemp({ ...toolTemp, marca: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            value={toolTemp.NParte}
            placeholder="N° Parte"
            onChange={(e) => setToolTemp({ ...toolTemp, NParte: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={toolTemp.ubicacion}
            onChange={(e) => setToolTemp({ ...toolTemp, ubicacion: e.target.value })}
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
            value={toolTemp.estado}
            onChange={(e) => setToolTemp({ ...toolTemp, estado: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Seleccione estado</option>
            <option value="Disponible">Disponible</option>
            <option value="En uso">En uso</option>
          </select>
          <select
            value={toolTemp.calibracion}
            onChange={(e) => setToolTemp({ ...toolTemp, calibracion: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Seleccione Calibracion</option>
            <option value="Calibrada">Calibrada</option>
            <option value="No calibrada">No calibrada</option>
            <option value="No necesita">No necesita</option>
          </select>
          <input
            value={toolTemp.tipo}
            placeholder="Tipo"
            onChange={(e) => setToolTemp({ ...toolTemp, tipo: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            value={toolTemp.observacion}
            placeholder="Observación"
            onChange={(e) => setToolTemp({ ...toolTemp, observacion: e.target.value })}
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
