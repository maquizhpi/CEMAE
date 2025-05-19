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
  usuario: string;
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
  correo: string;
  telefono: string;
  rol: UserRole;
  estado: string;
};

export type CloudImage = {
  secure_url: string;
};

export type Ubicaciones = {
  id?: string;
  nombre: string;
};

export type ModelosHerramienta = {
  id?: string;
  nombre: string;
};

// Modelo para los productos
export type Herramienta = {
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

// Modelo para las ventas
export type Bodega = {
  id?: string;
  number: number;
  herramientas: Array<Herramienta>;
  fechaDeCreacion: string;
  creador: string;
  bodegueroAsignado: string;
  nombreBodega: string;
};

// Modelo para las ventas
export type Solicitude = {
  id?: string;
  number: number;
  herramientas: Array<Herramienta>;
  fecha: string;
  solicitante: string;
  receptor: string;
  estado: string;
};

export type Calibracion = {
  id?: string;
  number: number;
  herramientas: Array<Herramienta>;
  fecha: string;
  solicitante: string;
  estado: string;
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

export interface ModalProps<T> {
  visible: boolean;
  close: () => void;
  onDone?: (data?: T) => void | Promise<void>;
}

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
