import { FormikProps, FormikErrors, FormikTouched } from "formik";

//tipos de datos para la app
export type AuthContextProps = {
  auth: Usuario | null;
  login: (userData: Usuario) => void;
  logout: () => void;
};

//Datos de respuesta
export type ResponseData = {
  message?: string;
  data?: any;
  success: boolean;
};

//Datos del login
export type LoginData = {
  correo: string;
  contraseña: string;
};

//Roles del sistema
export type UserRole =
  | 0 //Administrador
  | 1 //Bodeguero
  | 2; //Cliente

// Modelo para los usuarios
export type Usuario = {
  id?: string;
  number: number;
  identificacion: string;
  usuario: string;
  contraseña: string;
  nombre: string;
  correo: {
    type: String,
    required: true,
    unique: true,
  };
  telefono: string;
  rol: UserRole;
  estado: string;
};

// modelo para url imgenes de las herramientas
export type CloudImage = {
  secure_url: string;
};

// Modelo para ubicaciones
export type Ubicaciones = {
  id?: string;
  nombre: string;
  bodega: string;
  bodegueroAsignado: {
    nombre: string;
    identificacion: string;
    correo: string;
    telefono: string;
  };
};

// Modelo para modelo de herramientas
export type ModelosHerramienta = {
  id?: string;
  nombre: string;
};

// Modelo para los productos
export type Herramienta = {
  nombreBodega: ReactNode;
  _id: string | string[];
  id?: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  serie: string;
  modelo: string;
  marca: string;
  NParte: string;
  ubicacion: string;
  estado: string;
  imagen: string;
  tipo: string;
  cantidad: number;
  observacion: string;
  calibracion: string;
  file?: File | CloudImage;
};

// Modelo para las bodegas

export type Bodega = {
  creadorNombre: any;
  _id: string;
  id?: string;
  number: number;
  ubicaciones: Array<Ubicaciones>;
  herramientas: Array<Herramienta>;
  fechaDeCreacion: string;
  creador: {
    nombre: string;
    identificacion: string;
    correo: string;
    telefono: string;
  };
  bodegueroAsignado: {
    toLowerCase(): unknown;
    nombre: string;
    identificacion: string;
    correo: string;
    telefono: string;
  };
  nombreBodega: string;
  ubicacionesBodega: {
    nombre: string;
  }
};


// Modelo para las solicitudes
export type Solicitude = {
  telefono: any;
  correo: string;
  identificacion: string;
  nombre: string;
  id?: string;
  number: number;
  herramientas: Array<Herramienta>;
  fecha: string;
  bodeguero:{
    nombre: string;
    identificacion: string;
    correo: string;
    telefono: string;
  }
  receptor: {    
    nombre: string;
    identificacion: string;
    correo: string;
    telefono: string;
  }
  estado: string;
  bodega: string;
  observacion: string;
};

// Modelo para las calibraciones
export type Calibracion = {
  id?: string;
  number: number;
  herramientas: Array<Herramienta>;
  fecha: string;
  bodeguero: string;
  estado: string;
  fechaCalibracion: string;
  fechaProximaCalibracion: string;
  empresaDeCalibracion: string;
  observacion: string;  
  documentoCalibracion: string; // URL del documento de calibración
};

//backups
export type Backup = {
  id?: string;
  solicitude: any | Solicitude;
  bodega: any | Bodega;
  usuario: any | Usuario;
  calibracion: any | Calibracion;
};

//Auditoria del sistema
export type Auditory = {
  id?: string;
  date: string;
  user: string;
  action: string;
};


//Modelo 
export interface ModalProps<T> {
  visible: boolean;
  close: () => void;
  onDone?: (data?: T) => void | Promise<void>;
}

//Modelo para los formularios
export interface FormikComponentProps<T = Element> extends FormikProps<T> {
  formik: {
    values: T;
    handleChange: {
      (e: ChangeEvent<any>): void;
      <T_1 = string | ChangeEvent<T>>(field: T_1): T_1 extends ChangeEvent<T>
        ? void
        : (e: string | ChangeEvent<T>) => void;
    };
    touched: FormikTouched<T>;
    errors: FormikErrors<T>;
    setFieldValue: (
      field: string,
      value: T,
      shouldValidate?: boolean
    ) => Promise<void> | Promise<FormikErrors<T>>;
    setFieldError: (field: string, value: string) => void;
  };
}
