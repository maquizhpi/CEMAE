import mongoose, { mongo, Schema } from "mongoose";
import {
  Auditory,
  Backup,
  Bodega,
  Calibracion,
  Herramienta,
  ModelosHerramienta,
  Solicitude,
  Ubicaciones,
  Usuario,

} from "../models";
const UserSchema = new mongoose.Schema<Usuario>(
  {
    number: { type: Number },
    usuario: { type: String, unique: true },
    contraseña: { type: String },
    nombre: { type: String },
    correo: { type: String },
    identificacion: { type: String },
    telefono: { type: String },
    rol: { type: Number },
    estado: { type: String },
  },
  { timestamps: true }
);

// Duplicate the ID field.
UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
UserSchema.set("toJSON", {
  virtuals: true,
});

export const UserModel =
  mongoose.models.Users || mongoose.model("Users", UserSchema);

const UbicacionesSchema = new mongoose.Schema<Ubicaciones>(
  {
    nombre: { type: String },
  },
  { timestamps: true }
);

// Duplicate the ID field.
UbicacionesSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
UbicacionesSchema.set("toJSON", {
  virtuals: true,
});

export const UbicacionesModel =
  mongoose.models.Ubicaciones ||
  mongoose.model("Ubicaciones", UbicacionesSchema);

const ModeloHerramientaSchema = new mongoose.Schema<ModelosHerramienta>(
  {
    nombre: { type: String },
  },
  { timestamps: true }
);

// Duplicate the ID field.
ModeloHerramientaSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
ModeloHerramientaSchema.set("toJSON", {
  virtuals: true,
});

export const ModeloHerramientaModel =
  mongoose.models.ModeloHerramienta ||
  mongoose.model("ModeloHerramienta", ModeloHerramientaSchema);

const HerramientaSchema = new mongoose.Schema<Herramienta>(
  {
    nombre: { type: String },
    codigo: { type: String },
    descripcion: { type: String },
    serie: { type: String },
    modelo: { type: String },
    marca: { type: String },
    NParte: { type: String },
    ubicacion: { type: String },
    estado: { type: String },
    imagen: { type: String },
    tipo: { type: String },
    cantidad: { type: Number },
    observacion: { type: String },
    calibracion: { type: String },
  },
  { timestamps: true }
);

// Duplicate the ID field.
HerramientaSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
HerramientaSchema.set("toJSON", {
  virtuals: true,
});

export const HerramientaModel =
  mongoose.models.Herramienta ||
  mongoose.model("Herramienta", HerramientaSchema);

const BodegaSchema = new mongoose.Schema<Bodega>(
  {
    number: { type: Number },
    fechaDeCreacion: { type: String },
    bodegueroAsignado: { type: String },
    herramientas: { type: [HerramientaSchema] },
    creador: { type: String },
    nombreBodega: { type: String },  
  },
  { timestamps: true }
);

// Duplicate the ID field.
BodegaSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
BodegaSchema.set("toJSON", {
  virtuals: true,
});

export const BodegaModel =
  mongoose.models.Bodegas || mongoose.model("Bodegas", BodegaSchema);

const SolicitudeSchema = new mongoose.Schema<Solicitude>(
  {
    number: { type: Number },
    fecha: { type: String },
    solicitante: { type: String },
    herramientas: { type: [HerramientaSchema] },
    receptor: { type: String },
    estado: { type: String },
    observacion: { type: String, default: "" },
  },
  { timestamps: true }
);

// Duplicate the ID field.
SolicitudeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
SolicitudeSchema.set("toJSON", {
  virtuals: true,
});

export const SolicitudeModel =
  mongoose.models.Solicitudes ||
  mongoose.model("Solicitudes", SolicitudeSchema);

const CalibracionSchema = new mongoose.Schema<Calibracion>(
  {
    number: { type: Number },
    fecha: { type: String },
    solicitante: { type: String },
    herramientas: { type: [HerramientaSchema] },
    estado: { type: String },
  },
  { timestamps: true }
);

// Duplicate the ID field.
CalibracionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
CalibracionSchema.set("toJSON", {
  virtuals: true,
});

export const CalibracionModel =
  mongoose.models.Calibracion ||
  mongoose.model("Calibracion", CalibracionSchema);

  const BackupBodegaSchema = new mongoose.Schema<Backup>(
    {
      solicitude: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bodegas",
      },
    },
    { timestamps: true }
  );
  
  BackupBodegaSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  BackupBodegaSchema.set("toJSON", {
    virtuals: true,
  });
  
  export const BackupBodegaModel =
    mongoose.models.BackupsBodega ||
    mongoose.model("BackupsBodega", BackupBodegaSchema);
  

const BackupSolicitudesSchema = new mongoose.Schema<Backup>(
  {
    solicitude: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solicitudes",
    },
  },
  { timestamps: true }
);

BackupSolicitudesSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

BackupSolicitudesSchema.set("toJSON", {
  virtuals: true,
});

export const BackupSolicitudesModel =
  mongoose.models.BackupsSolicitudes ||
  mongoose.model("BackupsSolicitudes", BackupSolicitudesSchema);

const BackupCalibracionSchema = new mongoose.Schema<Backup>(
    {
      solicitude: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Calibracion",
      },
    },
    { timestamps: true }
  );
  
  BackupCalibracionSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  BackupCalibracionSchema.set("toJSON", {
    virtuals: true,
  });
  
  export const BackupCalibracionModel =
    mongoose.models.BackupsCalibracion ||
    mongoose.model("BackupsCalibracion", BackupCalibracionSchema);

const AuditorySchema = new mongoose.Schema<Auditory>(
  {
    date: { type: String },
    user: { type: String },
    action: { type: String },
  },
  { timestamps: true }
);

// Duplicate the ID field.
AuditorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
AuditorySchema.set("toJSON", {
  virtuals: true,
});

export const AuditoryModel =
  mongoose.models.Auditory || mongoose.model("Auditory", AuditorySchema);