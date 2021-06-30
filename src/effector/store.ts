import { createEvent, createStore, combine } from 'effector';
import { computeMetrics, computeSummary } from '../utils/helper';
import { ErrorMessage, GroupedOrders, TableData } from '../utils/types';

// Events
export const addError = createEvent<ErrorMessage>();
export const addGroupedOrders = createEvent<GroupedOrders>();
export const addTableData = createEvent<TableData>();

// Stores
export const $errors = createStore<ErrorMessage[]>([]).on(addError, (state, error) => [
  ...state,
  error,
]);
export const $groupedOrders = createStore<GroupedOrders>({}).on(
  addGroupedOrders,
  (_, groupedOrders) => groupedOrders,
);
export const $metrics = $groupedOrders.map(computeMetrics);
export const $tableData = createStore<TableData>([]).on(addTableData, (_, data) => data);
export const $summaryData = combine($metrics, $tableData, computeSummary);
