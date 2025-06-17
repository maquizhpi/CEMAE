import styled from "styled-components";
import theme from "../../../controllers/styles/theme";

export type TableContainerProps = {
  headerBackground?: string;
  contentBackground?: string;
  headerColor?: string;
  contentColor?: string;
};

 const TableContainer = styled.div<TableContainerProps>`
  overflow-x: auto;
  .dx-treelist {
    font-size: 12px;
    min-width: 600px;
  }
  .dx-treelist .dx-row > td {
    padding: 4px 6px;
    white-space: nowrap;
  }

  .dx-treelist-headers {
      background-color: ${({ headerBackground }) => headerBackground ?? theme.colors.blue};
      color: ${({ headerColor }) => headerColor ?? "white"};
  }

    ${({ headerColor }: TableContainerProps) => {
      if (headerColor) return `color: ${headerColor};`;
    }}
  }
  .dx-header-filter {
    ${({ headerColor }: TableContainerProps) => {
      if (headerColor) return `color: ${headerColor};`;
    }}
  }
  .dx-treelist-rowsview {
    ${({ contentBackground }: TableContainerProps) => {
      if (contentBackground) return `background-color: ${contentBackground};`;
    }}
    ${({ contentColor }: TableContainerProps) => {
      if (contentColor) return `color: ${contentColor};`;
    }}
  }
  .dx-info {
    color: black;
    opacity: 1;
  }
  .dx-treelist-headers {
    border: 1px solid ${theme.colors.blue};
    border-radius: 8px;
    overflow: hidden;

  }
  .dx-treelist-headers td {
    border: 1px solid ${theme.colors.blue};
    border-radius: 8px;
    overflow: hidden;
  }
  .dx-treelist-rowsview {
    border: 1px solid ${theme.colors.blue};
    border-radius: 8px;
    overflow: hidden;
  }
  .dx-treelist-rowsview td {
    border: 1px solid ${theme.colors.blue};
    border-radius: 8px;
    overflow: hidden;
  }
`;
export default TableContainer