import { createEvent, createStore } from 'effector';
import {
  ComputedTotalMetric,
  ErrorMessage,
  GroupedOrders,
  SummaryData,
  TableData,
} from '../utils/types';

// Initialize store
export const addMetric = createEvent<ComputedTotalMetric>();
export const addError = createEvent<ErrorMessage>();
export const addGroupedOrders = createEvent<GroupedOrders>();
export const addTableData = createEvent<TableData>();
export const addSummaryData = createEvent<SummaryData>();

export const $errors = createStore<ErrorMessage[]>([]).on(addError, (state, error) => [
  ...state,
  error,
]);
export const $metrics = createStore<ComputedTotalMetric>({}).on(addMetric, (_, metric) => metric);
export const $groupedOrders = createStore<GroupedOrders>({}).on(
  addGroupedOrders,
  (_, groupedOrders) => groupedOrders,
);
export const $tableData = createStore<TableData>([]).on(addTableData, (_, data) => data);
export const $summaryData = createStore<SummaryData>({}).on(addSummaryData, (_, data) => data);
