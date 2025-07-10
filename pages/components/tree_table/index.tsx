// Importaciones de componentes de DevExtreme y React
import TreeList, {
  Column,
  HeaderFilter,
  SearchPanel,
  Button,
  Editing,
  Scrolling,
  Paging,
  Pager,
  Selection,
  ContentReadyEvent,
} from "devextreme-react/tree-list";
import { useEffect, useState } from "react";
import { loadMessages } from "devextreme/localization";
import TableContainer, { TableContainerProps } from "./styles";

// Tipado para las columnas de la tabla
export type ColumnData = {
  dataField: string;
  caption: string;
  dataType?: any;
  headerCellRender?: (data: any) => React.ReactNode;
  cellRender?: (params: any) => React.ReactNode;
  subColumns?: ColumnData[];
  width?: number;
  minWidth?: number;
  alignment?: "left" | "center" | "right";
  cssClass?: string;
};

// Tipado para los botones de acción por fila
export type TableButtons = {
  cssClass?: string;
  show?: (rowData: any) => void;
  edit?: (rowData: any) => void;
  edit2?: (rowData: any) => void;
  delete?: (rowData: any) => void;
  download?: (rowData: any) => void;
};

// Tipado para habilitar acciones CRUD por defecto
export type DefaultActions = {
  updating: boolean;
  deleting: boolean;
  adding: boolean;
};

// Tipado completo para las props del componente
type Props = {
  id?: string;
  keyExpr?: string;
  columns: ColumnData[];
  dataSource: any[];
  columnAutoWidth?: boolean;
  buttons?: TableButtons;
  searchPanel?: boolean;
  headerFilter?: boolean;
  columnHidingEnabled?: boolean;
  defaultActions?: DefaultActions;
  style?: React.CSSProperties;
  colors?: TableContainerProps;
  buttonsFirst?: boolean;
  rowAlternationEnabled?: string;
  onRow?: {
    removed: (data: any) => Promise<void> | void;
    updated: (data: any) => Promise<void> | void;
    inserted: (data: any) => Promise<void> | void;
  };
  scrolling?: boolean;
  paging?: boolean;
  pageSize?: number;
  showNavigationButtons?: boolean;
  infoText?: (actual: string, total: string, items: string) => string;
  showNavigationInfo?: boolean;
  showLines?: boolean;
  onSelectedRows?: (values: Array<any>) => void;
  onFilteredDataChange?: (filteredData: any[]) => void;
};

// Función recursiva para renderizar columnas del TreeList (soporta subcolumnas anidadas)
const columnsRender = (cols: ColumnData[], index = "1_"): React.ReactNode => {
  return cols.map((column, columnindex) => {
    if (column.subColumns !== undefined) {
      return (
        <Column
          cssClass={column.cssClass}
          key={index + columnindex}
          caption={column.caption}
          headerCellRender={column.headerCellRender}
          width={column.width}
          minWidth={column.minWidth}
          alignment={column.alignment}
        >
          {columnsRender(column.subColumns, index + columnindex + "_")}
        </Column>
      );
    } else {
      return (
        <Column
          cssClass={column.cssClass}
          key={index + columnindex}
          dataField={column.dataField}
          caption={column.caption}
          headerCellRender={column.headerCellRender}
          cellRender={column.cellRender}
          width={column.width}
          minWidth={column.minWidth}
          alignment="left"
        />
      );
    }
  });
};

// Renderiza la columna de botones personalizados o por defecto según se definan
const allButtons = (
  buttons?: TableButtons,
  defaultActions?: DefaultActions
) => {
  return buttons ? (
    <Column type="buttons" caption="Acciones" cssClass={buttons.cssClass}>
      {buttons.show && (
        <Button
          text="mostrar"
          hint="mostrar"
          icon="/show.svg"
          onClick={({ row }: any) => buttons.show!(row.data)}
          cssClass="actionButtonShow"
        />
      )}
      {buttons.edit && (
        <Button
          text="editar"
          hint="editar"
          icon="/edit.svg"
          onClick={({ row }: any) => buttons.edit!(row.data)}
          cssClass="actionButtonEdit"
        />
      )}
      {buttons.edit2 && (
        <Button
          text="Medico"
          hint="Medico"
          icon="/tratamiento.png"
          onClick={({ row }: any) => buttons.edit2!(row.data)}
          cssClass="actionButtonEdit2"
        />
      )}
      {buttons.delete && (
        <Button
          text="eliminar"
          hint="eliminar"
          icon="/delete.svg"
          onClick={({ row }: any) => buttons.delete!(row.data)}
          cssClass="actionButtonDelete"
        />
      )}
      {buttons.download && (
        <Button
          text="descargar"
          hint="descargar"
          icon="/download.svg"
          onClick={({ row }: any) => buttons.download!(row.data)}
          cssClass="actionButtonDownload"
        />
      )}
    </Column>
  ) : (
    defaultActions && (
      <Column type="buttons" caption="Acciones">
        <Button
          name="edit"
          hint="editar"
          text="editar"
          icon="/edit.svg"
          cssClass="actionButtonEdit"
        />
        <Button
          name="delete"
          hint="eliminar"
          text="eliminar"
          icon="/delete.svg"
          cssClass="actionButtonDelete"
        />
        <Button name="save" hint="guardar" text="guardar" icon="/save.svg" />
        <Button
          name="cancel"
          hint="cancelar"
          text="cancelar"
          icon="/cancel.svg"
        />
      </Column>
    )
  );
};

// Traducción de algunos textos por defecto de DevExtreme al español
loadMessages({
  en: {
    Yes: "Si",
    No: "No",
    "dxList-selectAll": "Todos",
  },
});

// Componente principal que representa la tabla en forma de árbol (TreeList)
const TreeTable = ({
  id = "treeTable",
  keyExpr = "id",
  columns,
  dataSource,
  columnAutoWidth = true,
  buttons,
  searchPanel = true,
  headerFilter = true,
  defaultActions,
  style,
  columnHidingEnabled = false,
  colors,
  buttonsFirst = false,
  onRow,
  scrolling = false,
  paging = false,
  pageSize = 40,
  showNavigationButtons = false,
  infoText,
  showNavigationInfo = false,
  showLines = true,
  onSelectedRows,
  onFilteredDataChange,
}: Props) => {
  // Estado para los datos a renderizar en la tabla
  const [tableData, setTableData] = useState<any[]>(dataSource);
  // Estado para filas seleccionadas
  const [selectedRowKeys, setSelectedRowsKeys] = useState([]);

  // Manejador de cambio de selección de filas
  const onSelectionChanged = (e: any) => {
    setSelectedRowsKeys(e.selectedRowKeys);
    onSelectedRows?.(e.selectedRowsData);
  };

  // Manejador para obtener los datos filtrados visibles actualmente
  const onContentReady = (e: any) => {
    const filteredData = e.component.getVisibleRows().map((r: any) => r.data);
    onFilteredDataChange?.(filteredData);
  };

  // Efecto para actualizar los datos de la tabla si cambia el prop dataSource
  useEffect(() => setTableData(dataSource), [dataSource]);

  return (
    <TableContainer {...colors}>
      <div className="w-full overflow-x-auto">
        <TreeList
          id={id}
          dataSource={tableData}
          columnAutoWidth={columnAutoWidth}
          showBorders={showLines}
          showRowLines={showLines}
          noDataText="No hay datos ingresados..."
          dataStructure="plain"
          rootValue="-1"
          keyExpr={keyExpr}
          rowAlternationEnabled={true}
          style={style}
          onRowRemoved={(e) => onRow?.removed(e.data)}
          onRowUpdated={(e) => onRow?.updated(e.data)}
          onRowInserted={(e) => onRow?.inserted(e.data)}
          selectedRowKeys={selectedRowKeys}
          onSelectionChanged={onSelectionChanged}
          onContentReady={onContentReady}
        >
          {/* Si se habilita selección múltiple */}
          {onSelectedRows && <Selection mode="multiple" />}
          {/* Configuración de scroll o paginación */}
          {(scrolling || paging) && <Scrolling mode="standard" />}
          <Paging enabled={paging} defaultPageSize={pageSize} />
          <Pager
            showNavigationButtons={showNavigationButtons}
            infoText={infoText && infoText("{0}", "{1}", "{2}")}
            showInfo={showNavigationInfo}
          />
          {/* Panel de búsqueda */}
          {searchPanel && <SearchPanel visible={true} width={250} />}
          {/* Filtro por columnas */}
          {headerFilter && (
            <HeaderFilter
              visible={true}
              texts={{
                cancel: "Cancelar",
                ok: "Filtrar",
                emptyValue: "Sin asignar",
              }}
            />
          )}
          {/* Botones antes de las columnas */}
          {buttonsFirst && allButtons(buttons, defaultActions)}
          {/* Renderizado dinámico de columnas */}
          {columnsRender(columns)}
          {/* Botones después de las columnas */}
          {!buttonsFirst && allButtons(buttons, defaultActions)}
          {/* Configuración de acciones CRUD */}
          {defaultActions && (
            <Editing
              allowUpdating={defaultActions?.updating ?? false}
              allowDeleting={defaultActions?.deleting ?? false}
              allowAdding={defaultActions?.adding ?? false}
              texts={{
                confirmDeleteMessage:
                  "¿Estas seguro que deseas eliminar este dato?",
              }}
              mode="row"
            />
          )}
        </TreeList>
      </div>
    </TableContainer>
  );
};

export default TreeTable;
