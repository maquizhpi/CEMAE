import mongoose, { mongo, Schema, Model } from "mongoose";
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
////////////// Modelo para los usuarios////////////////
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
    imagen: { type: String },
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
  mongoose.models.Users || 
  mongoose.model("Users", UserSchema);

//////////////////////Modelo para los ubicaciones//////////////////////////
const UbicacionesSchema = new mongoose.Schema<Ubicaciones>(
  {
    nombre: { type: String },
    bodega: { type: String, ref: "Bodegas" },
    bodegueroAsignado: {
      nombre: { type: String },
      identificacion: { type: String },
      correo: { type: String },
      telefono: { type: String },
    },
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

 //////////////////////Modelo para los modelos////////////////////////// 
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

//////////////////////Modelo para herramientas//////////////////////////
export interface HerramientaDocument extends Herramienta, Document {}

const HerramientaSchema = new Schema<HerramientaDocument>(
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

HerramientaSchema.virtual("id").get(function () {
  return this._id?.toString?.() ?? this._id;
});

HerramientaSchema.set("toJSON", { virtuals: true });

export const HerramientaModel: Model<HerramientaDocument> =
  mongoose.models.herramienta ||
  mongoose.model<HerramientaDocument>("herramienta", HerramientaSchema);

//////////////////////Modelo para los bodegas//////////////////////////
export interface BodegaDocument extends Bodega, Document {}
const BodegaSchema = new Schema<BodegaDocument>(
  {
    number: { type: Number },
    fechaDeCreacion: { type: String },
    bodegueroAsignado: {
      nombre: { type: String },
      identificacion: { type: String },
      correo: { type: String },
      telefono: { type: String },
    },
    creador: {
      nombre: { type: String },
      identificacion: { type: String },
      correo: { type: String },
      telefono: { type: String },
    },
    nombreBodega: { type: String },
    ubicaciones: { type: [UbicacionesSchema] },
    herramientas: { type: [HerramientaSchema] },
    ubicacionesBodega: { type: String },
  },
  { timestamps: true }
);

BodegaSchema.virtual("id").get(function () {
  return this._id?.toString?.() ?? this._id;
});

BodegaSchema.set("toJSON", { virtuals: true });

export const BodegaModel: Model<BodegaDocument> =
  mongoose.models.Bodegas || mongoose.model<BodegaDocument>("Bodegas", BodegaSchema);

// //////////////Modelo para las solicitudes//////////////////
export interface SolicitudeDocument extends Solicitude, Document {}

const SolicitudeSchema: Schema<SolicitudeDocument> = new Schema(
  {
    number: { type: Number },
    fecha: { type: String },
    bodeguero: {
      nombre: { type: String },
      identificacion: { type: String },
      telefono: { type: String },
      correo: { type: String },
    },
    herramientas: [HerramientaSchema], 
    receptor: {
      nombre: { type: String },
      identificacion: { type: String },
      telefono: { type: String },
      correo: { type: String },
    },
    estado: { type: String },
    observacion: { type: String, default: "" },
  },
  { timestamps: true }
);

SolicitudeSchema.virtual("id").get(function (this: { _id: any }) {
  return this._id?.toString?.() ?? this._id;
});

SolicitudeSchema.set("toJSON", { virtuals: true });

export const SolicitudeModel: Model<SolicitudeDocument> =
  mongoose.models.Solicitudes ||
  mongoose.model<SolicitudeDocument>("Solicitudes", SolicitudeSchema);

//////////////////////Modelo para calibracion//////////////////////////
const CalibracionSchema = new mongoose.Schema<Calibracion>(
  {
    number: { type: Number },
    fecha: { type: String },
    bodeguero: { type: String },
    herramientas: { type: [HerramientaSchema] },
    estado: { type: String },
    fechaCalibracion: { type: String },
    fechaProximaCalibracion: { type: String },
    empresaDeCalibracion: { type: String },
    observacion: { type: String, default: "" },
    documentoCalibracion: { type: String },
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


//////////////////////Modelo para BackupBodega//////////////////////////
const BackupBodegaSchema = new mongoose.Schema<Backup>(
  {
    solicitude: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bodegas",
    },
  },
  { timestamps: true }
);
// Duplicate the ID field.
  BackupBodegaSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
// Ensure virtual fields are serialised.  
  BackupBodegaSchema.set("toJSON", {
    virtuals: true,
  });
  
export const BackupBodegaModel =
  mongoose.models.BackupsBodega ||
  mongoose.model("BackupsBodega", BackupBodegaSchema);
  
//////////////////////Modelo para los Backupsolicitudes//////////////////////////
const BackupSolicitudesSchema = new mongoose.Schema<Backup>(
  {
    solicitude: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solicitudes",
    },
  },
  { timestamps: true }
);

// Duplicate the ID field.
BackupSolicitudesSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
// Ensure virtual fields are serialised.
BackupSolicitudesSchema.set("toJSON", {
  virtuals: true,
});

export const BackupSolicitudesModel =
  mongoose.models.BackupsSolicitudes ||
  mongoose.model("BackupsSolicitudes", BackupSolicitudesSchema);

// //////////////////////Modelo para BackupUsuarios //////////////////////////
const BackupUsuariosSchema = new mongoose.Schema<Backup>(
  {
    solicitude: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);
// Duplicate the ID field.
BackupUsuariosSchema.virtual("id").get(function () {
  return this._id.toHexString();
}); 
// Ensure virtual fields are serialised.
BackupUsuariosSchema.set("toJSON", {
  virtuals: true,   
});
export const BackupUsuariosModel =  
  mongoose.models.BackupsUsuarios ||
  mongoose.model("BackupsUsuarios", BackupUsuariosSchema);
  
//////////////////////Modelo para Backupcalibracion//////////////////////////
const BackupCalibracionSchema = new mongoose.Schema<Backup>(
    {
      solicitude: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Calibracion",
      },
    },
    { timestamps: true }
  );
// Duplicate the ID field.  
BackupCalibracionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
// Ensure virtual fields are serialised.
BackupCalibracionSchema.set("toJSON", {
  virtuals: true,
});

export const BackupCalibracionModel =
  mongoose.models.BackupsCalibracion ||
  mongoose.model("BackupsCalibracion", BackupCalibracionSchema);

// //////////////////////Modelo para auditorias//////////////////////////
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

