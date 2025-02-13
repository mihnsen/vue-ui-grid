var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { computed, inject, reactive, ref, watch, defineComponent, unref, openBlock, createElementBlock, createElementVNode, Fragment, renderList, normalizeClass, createCommentVNode, renderSlot, toDisplayString, createBlock, resolveDynamicComponent, withCtx, nextTick, createVNode, isRef, withDirectives, vModelSelect, onMounted, onBeforeUnmount, withModifiers, vShow, vModelCheckbox, vModelRadio } from "vue";
function useGridHeader(str) {
  if (str) {
    const s = str.charAt(0).toUpperCase() + str.slice(1);
    return s.replace(/_/, " ");
  }
  return str;
}
function useRouteState(router, props) {
  const route = router.currentRoute;
  const routeName = route.value.name;
  const getStateFromRoute = () => {
    const state = {};
    const query = route.value.query || {};
    if (query.gridstate) {
      state.gridstate = query.gridstate;
    } else {
      state.gridstate = new Date().getTime();
    }
    if (props.searchField && query[props.searchField]) {
      state[props.searchField] = query[props.searchField];
    }
    if (props.cursorPagination) {
      if (query.cursor) {
        state.currentPage = query.cursor;
      }
    } else {
      if (query.page) {
        state.currentPage = parseInt(query.page, 10);
      }
    }
    if (query.limit) {
      state.limit = parseInt(query.limit, 10);
    }
    if (query.order) {
      state.order = {
        by: query.order,
        type: query.order_type || "desc"
      };
    }
    const filter = {};
    if (props.searchField && query[props.searchField]) {
      filter[props.searchField] = query[props.searchField];
    }
    Object.keys(query).forEach((key) => {
      const column = props.columns.find((c) => c.field === key);
      if (column && (column.filter || column.field === props.searchField)) {
        filter[key] = query[key];
      }
    });
    state.where = filter;
    return state;
  };
  const updateRouteIfNeeded = (params) => {
    const { currentRoute } = router;
    if (currentRoute.value.name !== routeName) {
      return;
    }
    const newQuery = __spreadValues(__spreadValues({}, route.value.query), params);
    router.replace({ query: newQuery });
  };
  const routeGridParams = getStateFromRoute();
  const queryGridState = computed(() => {
    const { currentRoute } = router;
    const { query } = currentRoute.value;
    if (query && query.gridstate) {
      return query.gridstate;
    }
    return null;
  });
  return {
    queryGridState,
    routeGridParams,
    updateRouteIfNeeded
  };
}
function useGrid(props, emits, dataProvider, gridOption, watchProps = []) {
  const vGridOptions = inject("$vgrid", {
    debug: false,
    routerKey: null,
    perPage: 10,
    pageSizes: [5, 10, 20, 50, 100],
    hasSortType: true
  });
  let routeGridParams = {};
  let updateRouteIfNeeded = (query) => ({});
  let queryGridState = computed(() => ({}));
  if (props.routeState && vGridOptions.routerKey) {
    const router = inject(vGridOptions.routerKey);
    const useRouteStateInstance = useRouteState(router, props);
    routeGridParams = useRouteStateInstance.routeGridParams;
    updateRouteIfNeeded = useRouteStateInstance.updateRouteIfNeeded;
    queryGridState = useRouteStateInstance.queryGridState;
  }
  const hasColumnFilter = computed(() => {
    return props.columns.some((c) => c.filter);
  });
  const hasColumnOrder = computed(() => {
    return props.columns.some((c) => c.order);
  });
  const cardColumnClasses = computed(() => {
    return [
      `vgrid-col-md-${props.colMd}`,
      `vgrid-col-lg-${props.colLg}`,
      `vgrid-col-xl-${props.colXl}`
    ];
  });
  const DefaultDataState = {
    records: [],
    total: 0
  };
  const dataState = reactive(DefaultDataState);
  const defaultDataQuery = "";
  const defaultPage = props.cursorPagination ? "" : 0;
  const gridState = reactive(__spreadValues({
    isLoading: false,
    searchKeyword: "",
    currentPage: defaultPage,
    limit: props.perPage ? props.perPage : vGridOptions.perPage,
    pageSizes: vGridOptions.pageSizes,
    order: {
      by: props.sortBy || "",
      type: props.sortType
    },
    where: {},
    hasSortType: vGridOptions.hasSortType,
    gridstate: new Date().getTime(),
    query: defaultDataQuery
  }, routeGridParams));
  const currentState = computed(() => {
    let params = {
      [gridOption.value.searchField]: gridState.searchKeyword,
      limit: gridState.limit
    };
    if (gridOption.value.pageKey) {
      params[gridOption.value.pageKey] = gridState.currentPage;
    }
    if (props.orderable && gridState.order && gridState.order.by) {
      params.order = gridState.order.by;
      params.order_type = gridState.order.type;
    }
    const whereParams = Object.keys(gridState.where).reduce((acc, curr) => __spreadProps(__spreadValues({}, acc), {
      [curr]: gridState.where[curr]
    }), {});
    params = __spreadProps(__spreadValues(__spreadValues({}, params), whereParams), {
      gridstate: gridState.gridstate
    });
    return params;
  });
  const currentStateInString = computed(() => {
    return JSON.stringify(currentState.value);
  });
  const hasRecord = computed(() => dataState.records.length > 0);
  const columnVisibility = ref([]);
  const getHeaderColumnClasses = (column) => {
    const type = column.type || "text";
    const { field } = column;
    const classes = [`vgrid-column-type--${type}`, `vgrid-column-data--${field}`];
    if (column.width) {
      classes.push(`vgrid-field--${column.width}`);
    }
    if (column.class) {
      classes.push(column.class);
    }
    return classes;
  };
  const isEmptyData = computed(() => {
    return !dataState.records.length;
  });
  const visibleCols = computed(() => {
    return props.columns.filter((c) => columnVisibility.value.includes(c.field)).sort((a, b) => columnVisibility.value.indexOf(a.field) - columnVisibility.value.indexOf(b.field)).map((c) => __spreadProps(__spreadValues({}, c), {
      headerClasses: getHeaderColumnClasses(c),
      orderClasses: getOrderableColumnClasses(c),
      columnClasses: getColumnClasses(c),
      showedLabel: useGridHeader(c.label || c.field)
    }));
  });
  const gridClasses = computed(() => {
    return [`vgrid-${gridOption.value.displayType}`, `vgrid-${gridOption.value.dataType}`];
  });
  const setColumnVisibility = () => {
    columnVisibility.value = props.columns.filter((c) => c.type !== "hidden").filter((c) => !c.hidden).map((c) => c.field);
  };
  const getColumnClasses = (column) => {
    if (column.order !== false && column.type !== "custom") {
      if (column.field === gridState.order.by) {
        return "ordering";
      }
    }
    return "";
  };
  const isFiltered = computed(() => {
    let flag = false;
    Object.keys(gridState.where).forEach((key) => {
      flag = flag || !!gridState.where[key];
    });
    return flag;
  });
  const getData2 = () => {
    if (vGridOptions.debug) {
      console.log("vgrid - start get data ", gridState.searchKeyword);
    }
    if (!dataProvider) {
      console.log("vgrid - Your grid is not config any data provider");
      return;
    }
    gridState.isLoading = true;
    dataProvider.getData(gridState.currentPage, gridState.limit, gridState.searchKeyword, gridState.where, gridState.order).then(({ items, total: totalRecord, meta, query }) => {
      dataState.records = items;
      dataState.total = totalRecord;
      dataState.meta = meta;
      gridState.query = query;
    }).catch((error) => {
      if (error) {
        gridState.query = error.query;
      }
      console.log("vgrid error", error);
    }).then(() => {
      setTimeout(() => {
        gridState.isLoading = false;
        emits("data-changed", dataState.records);
      }, 250);
    });
  };
  const setOrder = (field) => {
    const column = props.columns.find((c) => c.field === field);
    if (column && column.order && column.type !== "custom") {
      if (gridState.order.by === field) {
        if (gridState.hasSortType) {
          gridState.order = __spreadProps(__spreadValues({}, gridState.order), {
            type: gridState.order.type === "desc" ? "asc" : "desc"
          });
        }
      } else {
        gridState.order = {
          by: field,
          type: "desc"
        };
      }
    }
  };
  const setFilter = (filterData) => {
    gridState.where = __spreadValues(__spreadValues({}, gridState.where), filterData);
  };
  const getOrderableColumnClasses = (column) => {
    const classes = [];
    if (column.order && column.type !== "custom") {
      classes.push("orderable");
      if (column.field === gridState.order.by) {
        classes.push(`${gridState.order.type}`);
      }
    }
    return classes;
  };
  const resetPageIndex = () => {
    gridState.currentPage = defaultPage;
  };
  const resetGrid = () => {
    gridState.currentPage = defaultPage;
    gridState.limit = props.perPage ? props.perPage : vGridOptions.perPage;
    gridState.searchKeyword = "";
    gridState.order = {
      by: props.sortBy,
      type: props.sortType
    };
    gridState.gridstate = new Date().getTime();
    gridState.where = {};
  };
  const watchPropsValue = computed(() => {
    return watchProps.reduce((acc, curr) => __spreadProps(__spreadValues({}, acc), {
      [curr]: props[curr]
    }), {});
  });
  watch(() => watchPropsValue.value, () => {
    dataProvider.setOptions(gridOption.value);
    resetGrid();
  });
  watch(() => props.columns, () => {
    columnVisibility.value = props.columns.filter((c) => c.type !== "hidden").filter((c) => !c.hidden).map((c) => c.field);
  });
  watch([
    () => gridState.where,
    () => gridState.searchKeyword,
    () => gridState.limit
  ], () => {
    resetPageIndex();
  }, { deep: true });
  watch(() => currentStateInString.value, (newVal) => {
    getData2();
    updateRouteIfNeeded(currentState.value);
  });
  watch(() => queryGridState.value, (newVal, oldVal) => {
    if (oldVal && !newVal) {
      resetGrid();
    }
  });
  return {
    hasColumnFilter,
    hasColumnOrder,
    cardColumnClasses,
    dataState,
    hasRecord,
    columnVisibility,
    isEmptyData,
    visibleCols,
    gridClasses,
    setColumnVisibility,
    gridState,
    isFiltered,
    getData: getData2,
    setOrder,
    setFilter,
    resetGrid
  };
}
class ADataProvider {
  constructor(options) {
    __publicField(this, "options");
    this.options = options;
  }
  getData(page, limit, search, filter, order) {
    return new Promise((resolve, reject) => {
      const response = {
        items: [],
        total: 0
      };
      resolve(response);
    });
  }
  applySearch(search) {
    return this;
  }
  applyFilter(filter) {
    return this;
  }
  applyOrder(order) {
    return this;
  }
  applyPagination(page) {
    return this;
  }
  setOptions(options) {
    this.options = options;
  }
}
class JsonDataProvider extends ADataProvider {
  constructor(data, options) {
    super(options);
    __publicField(this, "data");
    this.data = data;
  }
  updateData(data) {
    this.data = data;
  }
  getData(page, limit, searchKeyword, filter, order) {
    return new Promise((resolve) => {
      let data = [...this.data];
      data = this.getSearchedData(data, searchKeyword);
      data = this.getFilteredData(data, filter);
      data = this.getSortedData(data, order);
      const total = data.length;
      let items = data;
      if (this.options.pagination && data.length > limit) {
        items = data.slice(limit * page, limit * (page + 1));
      }
      const res = {
        items,
        total,
        query: {
          page,
          limit,
          searchKeyword,
          filter,
          order
        }
      };
      resolve(res);
    });
  }
  getSearchedData(data, searchKeyword) {
    let searched = data.filter((r) => r);
    if (searchKeyword) {
      const re = new RegExp(searchKeyword, "gi");
      searched = searched.filter((d) => {
        let matched = false;
        this.options.columns.forEach((c) => {
          if (re.test(`${d[c.field]}`)) {
            matched = true;
          }
        });
        return matched;
      });
    }
    return searched;
  }
  getFilteredData(data, filter) {
    let filtered = data;
    if (filter) {
      Object.keys(filter).map((key) => {
        const re = new RegExp(filter[key], "gi");
        filtered = filtered.filter((d) => re.test(d[key]));
      });
    }
    return filtered;
  }
  getSortedData(data, order) {
    let sortedData = data;
    if (order) {
      const column = this.options.columns.find((c) => c.field === order.by);
      if (column) {
        sortedData = sortedData.sort((a, b) => {
          let field = b[column.field];
          let compareField = a[column.field];
          if (order.type === "desc") {
            field = a[column.field];
            compareField = b[column.field];
          }
          if (column.type === "number") {
            return field - compareField;
          }
          if (typeof field === "string") {
            return field.localeCompare(compareField);
          }
          return 0;
        });
      }
    }
    return sortedData;
  }
}
class AjaxDataProvider extends ADataProvider {
  constructor(resource, options) {
    super(options);
    __publicField(this, "resource");
    __publicField(this, "cancelRequest");
    this.resource = resource;
    this.cancelRequest = null;
  }
  getData(page, limit, searchKeyword, filter, order) {
    let currPage = page;
    if (!this.options.cursorPagination) {
      if (this.options.getPageIndex) {
        currPage = this.options.getPageIndex(page);
      }
    }
    const params = {};
    if (this.options.pageKey) {
      params[this.options.pageKey] = currPage;
    }
    if (this.options.perPageKey) {
      params[this.options.perPageKey] = limit;
    }
    if (this.options.orderable && order) {
      if (this.options.sortKey && order.by) {
        params[this.options.sortKey] = order.by;
        if (this.options.sortTypeKey && order.type) {
          params[this.options.sortTypeKey] = order.type;
        }
      }
    }
    if (this.options.searchable && this.options.searchField && searchKeyword) {
      params[this.options.searchField] = searchKeyword;
    }
    if (filter) {
      const where = __spreadValues({}, filter);
      Object.keys(where).forEach((key) => {
        params[key] = where[key];
      });
    }
    if (!this.options.fetchData) {
      return Promise.reject(new Error("no fetch data option"));
    }
    let cancelToken = null;
    if (this.options.cancelToken) {
      if (this.cancelRequest) {
        this.cancelRequest("Operation canceled due to new request.");
      }
      const CancelToken = this.options.cancelToken;
      cancelToken = new CancelToken((executor) => {
        this.cancelRequest = executor;
      });
    }
    return this.options.fetchData(this.resource, {
      params,
      cancelToken
    }).then((data) => {
      let items = [];
      let total = 0;
      let meta = null;
      if (this.options.extractData) {
        const res = this.options.extractData(data);
        items = res.items;
        total = res.total;
        meta = res.meta;
      }
      return {
        items,
        total,
        meta,
        query: params
      };
    }).finally(() => {
      this.cancelRequest = null;
    });
  }
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function devAssert(condition, message) {
  const booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(message);
  }
}
function isObjectLike(value) {
  return typeof value == "object" && value !== null;
}
function invariant(condition, message) {
  const booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(message != null ? message : "Unexpected invariant triggered.");
  }
}
const LineRegExp = /\r\n|[\n\r]/g;
function getLocation(source, position) {
  let lastLineStart = 0;
  let line = 1;
  for (const match of source.body.matchAll(LineRegExp)) {
    typeof match.index === "number" || invariant(false);
    if (match.index >= position) {
      break;
    }
    lastLineStart = match.index + match[0].length;
    line += 1;
  }
  return {
    line,
    column: position + 1 - lastLineStart
  };
}
function printLocation(location) {
  return printSourceLocation(location.source, getLocation(location.source, location.start));
}
function printSourceLocation(source, sourceLocation) {
  const firstLineColumnOffset = source.locationOffset.column - 1;
  const body = "".padStart(firstLineColumnOffset) + source.body;
  const lineIndex = sourceLocation.line - 1;
  const lineOffset = source.locationOffset.line - 1;
  const lineNum = sourceLocation.line + lineOffset;
  const columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
  const columnNum = sourceLocation.column + columnOffset;
  const locationStr = `${source.name}:${lineNum}:${columnNum}
`;
  const lines = body.split(/\r\n|[\n\r]/g);
  const locationLine = lines[lineIndex];
  if (locationLine.length > 120) {
    const subLineIndex = Math.floor(columnNum / 80);
    const subLineColumnNum = columnNum % 80;
    const subLines = [];
    for (let i = 0; i < locationLine.length; i += 80) {
      subLines.push(locationLine.slice(i, i + 80));
    }
    return locationStr + printPrefixedLines([
      [`${lineNum} |`, subLines[0]],
      ...subLines.slice(1, subLineIndex + 1).map((subLine) => ["|", subLine]),
      ["|", "^".padStart(subLineColumnNum)],
      ["|", subLines[subLineIndex + 1]]
    ]);
  }
  return locationStr + printPrefixedLines([
    [`${lineNum - 1} |`, lines[lineIndex - 1]],
    [`${lineNum} |`, locationLine],
    ["|", "^".padStart(columnNum)],
    [`${lineNum + 1} |`, lines[lineIndex + 1]]
  ]);
}
function printPrefixedLines(lines) {
  const existingLines = lines.filter(([_, line]) => line !== void 0);
  const padLen = Math.max(...existingLines.map(([prefix]) => prefix.length));
  return existingLines.map(([prefix, line]) => prefix.padStart(padLen) + (line ? " " + line : "")).join("\n");
}
function toNormalizedOptions(args) {
  const firstArg = args[0];
  if (firstArg == null || "kind" in firstArg || "length" in firstArg) {
    return {
      nodes: firstArg,
      source: args[1],
      positions: args[2],
      path: args[3],
      originalError: args[4],
      extensions: args[5]
    };
  }
  return firstArg;
}
class GraphQLError extends Error {
  constructor(message, ...rawArgs) {
    var _this$nodes, _nodeLocations$, _ref;
    const { nodes, source, positions, path, originalError, extensions } = toNormalizedOptions(rawArgs);
    super(message);
    this.name = "GraphQLError";
    this.path = path !== null && path !== void 0 ? path : void 0;
    this.originalError = originalError !== null && originalError !== void 0 ? originalError : void 0;
    this.nodes = undefinedIfEmpty(Array.isArray(nodes) ? nodes : nodes ? [nodes] : void 0);
    const nodeLocations = undefinedIfEmpty((_this$nodes = this.nodes) === null || _this$nodes === void 0 ? void 0 : _this$nodes.map((node) => node.loc).filter((loc) => loc != null));
    this.source = source !== null && source !== void 0 ? source : nodeLocations === null || nodeLocations === void 0 ? void 0 : (_nodeLocations$ = nodeLocations[0]) === null || _nodeLocations$ === void 0 ? void 0 : _nodeLocations$.source;
    this.positions = positions !== null && positions !== void 0 ? positions : nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations.map((loc) => loc.start);
    this.locations = positions && source ? positions.map((pos) => getLocation(source, pos)) : nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations.map((loc) => getLocation(loc.source, loc.start));
    const originalExtensions = isObjectLike(originalError === null || originalError === void 0 ? void 0 : originalError.extensions) ? originalError === null || originalError === void 0 ? void 0 : originalError.extensions : void 0;
    this.extensions = (_ref = extensions !== null && extensions !== void 0 ? extensions : originalExtensions) !== null && _ref !== void 0 ? _ref : /* @__PURE__ */ Object.create(null);
    Object.defineProperties(this, {
      message: {
        writable: true,
        enumerable: true
      },
      name: {
        enumerable: false
      },
      nodes: {
        enumerable: false
      },
      source: {
        enumerable: false
      },
      positions: {
        enumerable: false
      },
      originalError: {
        enumerable: false
      }
    });
    if (originalError !== null && originalError !== void 0 && originalError.stack) {
      Object.defineProperty(this, "stack", {
        value: originalError.stack,
        writable: true,
        configurable: true
      });
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GraphQLError);
    } else {
      Object.defineProperty(this, "stack", {
        value: Error().stack,
        writable: true,
        configurable: true
      });
    }
  }
  get [Symbol.toStringTag]() {
    return "GraphQLError";
  }
  toString() {
    let output = this.message;
    if (this.nodes) {
      for (const node of this.nodes) {
        if (node.loc) {
          output += "\n\n" + printLocation(node.loc);
        }
      }
    } else if (this.source && this.locations) {
      for (const location of this.locations) {
        output += "\n\n" + printSourceLocation(this.source, location);
      }
    }
    return output;
  }
  toJSON() {
    const formattedError = {
      message: this.message
    };
    if (this.locations != null) {
      formattedError.locations = this.locations;
    }
    if (this.path != null) {
      formattedError.path = this.path;
    }
    if (this.extensions != null && Object.keys(this.extensions).length > 0) {
      formattedError.extensions = this.extensions;
    }
    return formattedError;
  }
}
function undefinedIfEmpty(array) {
  return array === void 0 || array.length === 0 ? void 0 : array;
}
function syntaxError(source, position, description) {
  return new GraphQLError(`Syntax Error: ${description}`, {
    source,
    positions: [position]
  });
}
class Location {
  constructor(startToken, endToken, source) {
    this.start = startToken.start;
    this.end = endToken.end;
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;
  }
  get [Symbol.toStringTag]() {
    return "Location";
  }
  toJSON() {
    return {
      start: this.start,
      end: this.end
    };
  }
}
class Token {
  constructor(kind, start, end, line, column, value) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
  get [Symbol.toStringTag]() {
    return "Token";
  }
  toJSON() {
    return {
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column
    };
  }
}
let OperationTypeNode;
(function(OperationTypeNode2) {
  OperationTypeNode2["QUERY"] = "query";
  OperationTypeNode2["MUTATION"] = "mutation";
  OperationTypeNode2["SUBSCRIPTION"] = "subscription";
})(OperationTypeNode || (OperationTypeNode = {}));
let DirectiveLocation;
(function(DirectiveLocation2) {
  DirectiveLocation2["QUERY"] = "QUERY";
  DirectiveLocation2["MUTATION"] = "MUTATION";
  DirectiveLocation2["SUBSCRIPTION"] = "SUBSCRIPTION";
  DirectiveLocation2["FIELD"] = "FIELD";
  DirectiveLocation2["FRAGMENT_DEFINITION"] = "FRAGMENT_DEFINITION";
  DirectiveLocation2["FRAGMENT_SPREAD"] = "FRAGMENT_SPREAD";
  DirectiveLocation2["INLINE_FRAGMENT"] = "INLINE_FRAGMENT";
  DirectiveLocation2["VARIABLE_DEFINITION"] = "VARIABLE_DEFINITION";
  DirectiveLocation2["SCHEMA"] = "SCHEMA";
  DirectiveLocation2["SCALAR"] = "SCALAR";
  DirectiveLocation2["OBJECT"] = "OBJECT";
  DirectiveLocation2["FIELD_DEFINITION"] = "FIELD_DEFINITION";
  DirectiveLocation2["ARGUMENT_DEFINITION"] = "ARGUMENT_DEFINITION";
  DirectiveLocation2["INTERFACE"] = "INTERFACE";
  DirectiveLocation2["UNION"] = "UNION";
  DirectiveLocation2["ENUM"] = "ENUM";
  DirectiveLocation2["ENUM_VALUE"] = "ENUM_VALUE";
  DirectiveLocation2["INPUT_OBJECT"] = "INPUT_OBJECT";
  DirectiveLocation2["INPUT_FIELD_DEFINITION"] = "INPUT_FIELD_DEFINITION";
})(DirectiveLocation || (DirectiveLocation = {}));
let Kind;
(function(Kind2) {
  Kind2["NAME"] = "Name";
  Kind2["DOCUMENT"] = "Document";
  Kind2["OPERATION_DEFINITION"] = "OperationDefinition";
  Kind2["VARIABLE_DEFINITION"] = "VariableDefinition";
  Kind2["SELECTION_SET"] = "SelectionSet";
  Kind2["FIELD"] = "Field";
  Kind2["ARGUMENT"] = "Argument";
  Kind2["FRAGMENT_SPREAD"] = "FragmentSpread";
  Kind2["INLINE_FRAGMENT"] = "InlineFragment";
  Kind2["FRAGMENT_DEFINITION"] = "FragmentDefinition";
  Kind2["VARIABLE"] = "Variable";
  Kind2["INT"] = "IntValue";
  Kind2["FLOAT"] = "FloatValue";
  Kind2["STRING"] = "StringValue";
  Kind2["BOOLEAN"] = "BooleanValue";
  Kind2["NULL"] = "NullValue";
  Kind2["ENUM"] = "EnumValue";
  Kind2["LIST"] = "ListValue";
  Kind2["OBJECT"] = "ObjectValue";
  Kind2["OBJECT_FIELD"] = "ObjectField";
  Kind2["DIRECTIVE"] = "Directive";
  Kind2["NAMED_TYPE"] = "NamedType";
  Kind2["LIST_TYPE"] = "ListType";
  Kind2["NON_NULL_TYPE"] = "NonNullType";
  Kind2["SCHEMA_DEFINITION"] = "SchemaDefinition";
  Kind2["OPERATION_TYPE_DEFINITION"] = "OperationTypeDefinition";
  Kind2["SCALAR_TYPE_DEFINITION"] = "ScalarTypeDefinition";
  Kind2["OBJECT_TYPE_DEFINITION"] = "ObjectTypeDefinition";
  Kind2["FIELD_DEFINITION"] = "FieldDefinition";
  Kind2["INPUT_VALUE_DEFINITION"] = "InputValueDefinition";
  Kind2["INTERFACE_TYPE_DEFINITION"] = "InterfaceTypeDefinition";
  Kind2["UNION_TYPE_DEFINITION"] = "UnionTypeDefinition";
  Kind2["ENUM_TYPE_DEFINITION"] = "EnumTypeDefinition";
  Kind2["ENUM_VALUE_DEFINITION"] = "EnumValueDefinition";
  Kind2["INPUT_OBJECT_TYPE_DEFINITION"] = "InputObjectTypeDefinition";
  Kind2["DIRECTIVE_DEFINITION"] = "DirectiveDefinition";
  Kind2["SCHEMA_EXTENSION"] = "SchemaExtension";
  Kind2["SCALAR_TYPE_EXTENSION"] = "ScalarTypeExtension";
  Kind2["OBJECT_TYPE_EXTENSION"] = "ObjectTypeExtension";
  Kind2["INTERFACE_TYPE_EXTENSION"] = "InterfaceTypeExtension";
  Kind2["UNION_TYPE_EXTENSION"] = "UnionTypeExtension";
  Kind2["ENUM_TYPE_EXTENSION"] = "EnumTypeExtension";
  Kind2["INPUT_OBJECT_TYPE_EXTENSION"] = "InputObjectTypeExtension";
})(Kind || (Kind = {}));
function isWhiteSpace(code) {
  return code === 9 || code === 32;
}
function isDigit(code) {
  return code >= 48 && code <= 57;
}
function isLetter(code) {
  return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function isNameStart(code) {
  return isLetter(code) || code === 95;
}
function isNameContinue(code) {
  return isLetter(code) || isDigit(code) || code === 95;
}
function dedentBlockStringLines(lines) {
  var _firstNonEmptyLine2;
  let commonIndent = Number.MAX_SAFE_INTEGER;
  let firstNonEmptyLine = null;
  let lastNonEmptyLine = -1;
  for (let i = 0; i < lines.length; ++i) {
    var _firstNonEmptyLine;
    const line = lines[i];
    const indent = leadingWhitespace(line);
    if (indent === line.length) {
      continue;
    }
    firstNonEmptyLine = (_firstNonEmptyLine = firstNonEmptyLine) !== null && _firstNonEmptyLine !== void 0 ? _firstNonEmptyLine : i;
    lastNonEmptyLine = i;
    if (i !== 0 && indent < commonIndent) {
      commonIndent = indent;
    }
  }
  return lines.map((line, i) => i === 0 ? line : line.slice(commonIndent)).slice((_firstNonEmptyLine2 = firstNonEmptyLine) !== null && _firstNonEmptyLine2 !== void 0 ? _firstNonEmptyLine2 : 0, lastNonEmptyLine + 1);
}
function leadingWhitespace(str) {
  let i = 0;
  while (i < str.length && isWhiteSpace(str.charCodeAt(i))) {
    ++i;
  }
  return i;
}
let TokenKind;
(function(TokenKind2) {
  TokenKind2["SOF"] = "<SOF>";
  TokenKind2["EOF"] = "<EOF>";
  TokenKind2["BANG"] = "!";
  TokenKind2["DOLLAR"] = "$";
  TokenKind2["AMP"] = "&";
  TokenKind2["PAREN_L"] = "(";
  TokenKind2["PAREN_R"] = ")";
  TokenKind2["SPREAD"] = "...";
  TokenKind2["COLON"] = ":";
  TokenKind2["EQUALS"] = "=";
  TokenKind2["AT"] = "@";
  TokenKind2["BRACKET_L"] = "[";
  TokenKind2["BRACKET_R"] = "]";
  TokenKind2["BRACE_L"] = "{";
  TokenKind2["PIPE"] = "|";
  TokenKind2["BRACE_R"] = "}";
  TokenKind2["NAME"] = "Name";
  TokenKind2["INT"] = "Int";
  TokenKind2["FLOAT"] = "Float";
  TokenKind2["STRING"] = "String";
  TokenKind2["BLOCK_STRING"] = "BlockString";
  TokenKind2["COMMENT"] = "Comment";
})(TokenKind || (TokenKind = {}));
class Lexer {
  constructor(source) {
    const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);
    this.source = source;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
  }
  get [Symbol.toStringTag]() {
    return "Lexer";
  }
  advance() {
    this.lastToken = this.token;
    const token = this.token = this.lookahead();
    return token;
  }
  lookahead() {
    let token = this.token;
    if (token.kind !== TokenKind.EOF) {
      do {
        if (token.next) {
          token = token.next;
        } else {
          const nextToken = readNextToken(this, token.end);
          token.next = nextToken;
          nextToken.prev = token;
          token = nextToken;
        }
      } while (token.kind === TokenKind.COMMENT);
    }
    return token;
  }
}
function isPunctuatorTokenKind(kind) {
  return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
}
function isUnicodeScalarValue(code) {
  return code >= 0 && code <= 55295 || code >= 57344 && code <= 1114111;
}
function isSupplementaryCodePoint(body, location) {
  return isLeadingSurrogate(body.charCodeAt(location)) && isTrailingSurrogate(body.charCodeAt(location + 1));
}
function isLeadingSurrogate(code) {
  return code >= 55296 && code <= 56319;
}
function isTrailingSurrogate(code) {
  return code >= 56320 && code <= 57343;
}
function printCodePointAt(lexer, location) {
  const code = lexer.source.body.codePointAt(location);
  if (code === void 0) {
    return TokenKind.EOF;
  } else if (code >= 32 && code <= 126) {
    const char = String.fromCodePoint(code);
    return char === '"' ? `'"'` : `"${char}"`;
  }
  return "U+" + code.toString(16).toUpperCase().padStart(4, "0");
}
function createToken(lexer, kind, start, end, value) {
  const line = lexer.line;
  const col = 1 + start - lexer.lineStart;
  return new Token(kind, start, end, line, col, value);
}
function readNextToken(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    switch (code) {
      case 65279:
      case 9:
      case 32:
      case 44:
        ++position;
        continue;
      case 10:
        ++position;
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 13:
        if (body.charCodeAt(position + 1) === 10) {
          position += 2;
        } else {
          ++position;
        }
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 35:
        return readComment(lexer, position);
      case 33:
        return createToken(lexer, TokenKind.BANG, position, position + 1);
      case 36:
        return createToken(lexer, TokenKind.DOLLAR, position, position + 1);
      case 38:
        return createToken(lexer, TokenKind.AMP, position, position + 1);
      case 40:
        return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
      case 41:
        return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
      case 46:
        if (body.charCodeAt(position + 1) === 46 && body.charCodeAt(position + 2) === 46) {
          return createToken(lexer, TokenKind.SPREAD, position, position + 3);
        }
        break;
      case 58:
        return createToken(lexer, TokenKind.COLON, position, position + 1);
      case 61:
        return createToken(lexer, TokenKind.EQUALS, position, position + 1);
      case 64:
        return createToken(lexer, TokenKind.AT, position, position + 1);
      case 91:
        return createToken(lexer, TokenKind.BRACKET_L, position, position + 1);
      case 93:
        return createToken(lexer, TokenKind.BRACKET_R, position, position + 1);
      case 123:
        return createToken(lexer, TokenKind.BRACE_L, position, position + 1);
      case 124:
        return createToken(lexer, TokenKind.PIPE, position, position + 1);
      case 125:
        return createToken(lexer, TokenKind.BRACE_R, position, position + 1);
      case 34:
        if (body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
          return readBlockString(lexer, position);
        }
        return readString(lexer, position);
    }
    if (isDigit(code) || code === 45) {
      return readNumber(lexer, position, code);
    }
    if (isNameStart(code)) {
      return readName(lexer, position);
    }
    throw syntaxError(lexer.source, position, code === 39 ? `Unexpected single quote character ('), did you mean to use a double quote (")?` : isUnicodeScalarValue(code) || isSupplementaryCodePoint(body, position) ? `Unexpected character: ${printCodePointAt(lexer, position)}.` : `Invalid character: ${printCodePointAt(lexer, position)}.`);
  }
  return createToken(lexer, TokenKind.EOF, bodyLength, bodyLength);
}
function readComment(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 10 || code === 13) {
      break;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      break;
    }
  }
  return createToken(lexer, TokenKind.COMMENT, start, position, body.slice(start + 1, position));
}
function readNumber(lexer, start, firstCode) {
  const body = lexer.source.body;
  let position = start;
  let code = firstCode;
  let isFloat = false;
  if (code === 45) {
    code = body.charCodeAt(++position);
  }
  if (code === 48) {
    code = body.charCodeAt(++position);
    if (isDigit(code)) {
      throw syntaxError(lexer.source, position, `Invalid number, unexpected digit after 0: ${printCodePointAt(lexer, position)}.`);
    }
  } else {
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46) {
    isFloat = true;
    code = body.charCodeAt(++position);
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 69 || code === 101) {
    isFloat = true;
    code = body.charCodeAt(++position);
    if (code === 43 || code === 45) {
      code = body.charCodeAt(++position);
    }
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46 || isNameStart(code)) {
    throw syntaxError(lexer.source, position, `Invalid number, expected digit but got: ${printCodePointAt(lexer, position)}.`);
  }
  return createToken(lexer, isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, body.slice(start, position));
}
function readDigits(lexer, start, firstCode) {
  if (!isDigit(firstCode)) {
    throw syntaxError(lexer.source, start, `Invalid number, expected digit but got: ${printCodePointAt(lexer, start)}.`);
  }
  const body = lexer.source.body;
  let position = start + 1;
  while (isDigit(body.charCodeAt(position))) {
    ++position;
  }
  return position;
}
function readString(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  let chunkStart = position;
  let value = "";
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 34) {
      value += body.slice(chunkStart, position);
      return createToken(lexer, TokenKind.STRING, start, position + 1, value);
    }
    if (code === 92) {
      value += body.slice(chunkStart, position);
      const escape = body.charCodeAt(position + 1) === 117 ? body.charCodeAt(position + 2) === 123 ? readEscapedUnicodeVariableWidth(lexer, position) : readEscapedUnicodeFixedWidth(lexer, position) : readEscapedCharacter(lexer, position);
      value += escape.value;
      position += escape.size;
      chunkStart = position;
      continue;
    }
    if (code === 10 || code === 13) {
      break;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      throw syntaxError(lexer.source, position, `Invalid character within String: ${printCodePointAt(lexer, position)}.`);
    }
  }
  throw syntaxError(lexer.source, position, "Unterminated string.");
}
function readEscapedUnicodeVariableWidth(lexer, position) {
  const body = lexer.source.body;
  let point = 0;
  let size = 3;
  while (size < 12) {
    const code = body.charCodeAt(position + size++);
    if (code === 125) {
      if (size < 5 || !isUnicodeScalarValue(point)) {
        break;
      }
      return {
        value: String.fromCodePoint(point),
        size
      };
    }
    point = point << 4 | readHexDigit(code);
    if (point < 0) {
      break;
    }
  }
  throw syntaxError(lexer.source, position, `Invalid Unicode escape sequence: "${body.slice(position, position + size)}".`);
}
function readEscapedUnicodeFixedWidth(lexer, position) {
  const body = lexer.source.body;
  const code = read16BitHexCode(body, position + 2);
  if (isUnicodeScalarValue(code)) {
    return {
      value: String.fromCodePoint(code),
      size: 6
    };
  }
  if (isLeadingSurrogate(code)) {
    if (body.charCodeAt(position + 6) === 92 && body.charCodeAt(position + 7) === 117) {
      const trailingCode = read16BitHexCode(body, position + 8);
      if (isTrailingSurrogate(trailingCode)) {
        return {
          value: String.fromCodePoint(code, trailingCode),
          size: 12
        };
      }
    }
  }
  throw syntaxError(lexer.source, position, `Invalid Unicode escape sequence: "${body.slice(position, position + 6)}".`);
}
function read16BitHexCode(body, position) {
  return readHexDigit(body.charCodeAt(position)) << 12 | readHexDigit(body.charCodeAt(position + 1)) << 8 | readHexDigit(body.charCodeAt(position + 2)) << 4 | readHexDigit(body.charCodeAt(position + 3));
}
function readHexDigit(code) {
  return code >= 48 && code <= 57 ? code - 48 : code >= 65 && code <= 70 ? code - 55 : code >= 97 && code <= 102 ? code - 87 : -1;
}
function readEscapedCharacter(lexer, position) {
  const body = lexer.source.body;
  const code = body.charCodeAt(position + 1);
  switch (code) {
    case 34:
      return {
        value: '"',
        size: 2
      };
    case 92:
      return {
        value: "\\",
        size: 2
      };
    case 47:
      return {
        value: "/",
        size: 2
      };
    case 98:
      return {
        value: "\b",
        size: 2
      };
    case 102:
      return {
        value: "\f",
        size: 2
      };
    case 110:
      return {
        value: "\n",
        size: 2
      };
    case 114:
      return {
        value: "\r",
        size: 2
      };
    case 116:
      return {
        value: "	",
        size: 2
      };
  }
  throw syntaxError(lexer.source, position, `Invalid character escape sequence: "${body.slice(position, position + 2)}".`);
}
function readBlockString(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let lineStart = lexer.lineStart;
  let position = start + 3;
  let chunkStart = position;
  let currentLine = "";
  const blockLines = [];
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
      currentLine += body.slice(chunkStart, position);
      blockLines.push(currentLine);
      const token = createToken(lexer, TokenKind.BLOCK_STRING, start, position + 3, dedentBlockStringLines(blockLines).join("\n"));
      lexer.line += blockLines.length - 1;
      lexer.lineStart = lineStart;
      return token;
    }
    if (code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
      currentLine += body.slice(chunkStart, position);
      chunkStart = position + 1;
      position += 4;
      continue;
    }
    if (code === 10 || code === 13) {
      currentLine += body.slice(chunkStart, position);
      blockLines.push(currentLine);
      if (code === 13 && body.charCodeAt(position + 1) === 10) {
        position += 2;
      } else {
        ++position;
      }
      currentLine = "";
      chunkStart = position;
      lineStart = position;
      continue;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      throw syntaxError(lexer.source, position, `Invalid character within String: ${printCodePointAt(lexer, position)}.`);
    }
  }
  throw syntaxError(lexer.source, position, "Unterminated string.");
}
function readName(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (isNameContinue(code)) {
      ++position;
    } else {
      break;
    }
  }
  return createToken(lexer, TokenKind.NAME, start, position, body.slice(start, position));
}
const MAX_ARRAY_LENGTH = 10;
const MAX_RECURSIVE_DEPTH = 2;
function inspect(value) {
  return formatValue(value, []);
}
function formatValue(value, seenValues) {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "function":
      return value.name ? `[function ${value.name}]` : "[function]";
    case "object":
      return formatObjectValue(value, seenValues);
    default:
      return String(value);
  }
}
function formatObjectValue(value, previouslySeenValues) {
  if (value === null) {
    return "null";
  }
  if (previouslySeenValues.includes(value)) {
    return "[Circular]";
  }
  const seenValues = [...previouslySeenValues, value];
  if (isJSONable(value)) {
    const jsonValue = value.toJSON();
    if (jsonValue !== value) {
      return typeof jsonValue === "string" ? jsonValue : formatValue(jsonValue, seenValues);
    }
  } else if (Array.isArray(value)) {
    return formatArray(value, seenValues);
  }
  return formatObject(value, seenValues);
}
function isJSONable(value) {
  return typeof value.toJSON === "function";
}
function formatObject(object, seenValues) {
  const entries = Object.entries(object);
  if (entries.length === 0) {
    return "{}";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[" + getObjectTag(object) + "]";
  }
  const properties = entries.map(([key, value]) => key + ": " + formatValue(value, seenValues));
  return "{ " + properties.join(", ") + " }";
}
function formatArray(array, seenValues) {
  if (array.length === 0) {
    return "[]";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[Array]";
  }
  const len = Math.min(MAX_ARRAY_LENGTH, array.length);
  const remaining = array.length - len;
  const items = [];
  for (let i = 0; i < len; ++i) {
    items.push(formatValue(array[i], seenValues));
  }
  if (remaining === 1) {
    items.push("... 1 more item");
  } else if (remaining > 1) {
    items.push(`... ${remaining} more items`);
  }
  return "[" + items.join(", ") + "]";
}
function getObjectTag(object) {
  const tag = Object.prototype.toString.call(object).replace(/^\[object /, "").replace(/]$/, "");
  if (tag === "Object" && typeof object.constructor === "function") {
    const name = object.constructor.name;
    if (typeof name === "string" && name !== "") {
      return name;
    }
  }
  return tag;
}
const instanceOf = function instanceOf2(value, constructor) {
  return value instanceof constructor;
};
class Source {
  constructor(body, name = "GraphQL request", locationOffset = {
    line: 1,
    column: 1
  }) {
    typeof body === "string" || devAssert(false, `Body must be a string. Received: ${inspect(body)}.`);
    this.body = body;
    this.name = name;
    this.locationOffset = locationOffset;
    this.locationOffset.line > 0 || devAssert(false, "line in locationOffset is 1-indexed and must be positive.");
    this.locationOffset.column > 0 || devAssert(false, "column in locationOffset is 1-indexed and must be positive.");
  }
  get [Symbol.toStringTag]() {
    return "Source";
  }
}
function isSource(source) {
  return instanceOf(source, Source);
}
function parse(source, options) {
  const parser = new Parser(source, options);
  return parser.parseDocument();
}
class Parser {
  constructor(source, options) {
    const sourceObj = isSource(source) ? source : new Source(source);
    this._lexer = new Lexer(sourceObj);
    this._options = options;
  }
  parseName() {
    const token = this.expectToken(TokenKind.NAME);
    return this.node(token, {
      kind: Kind.NAME,
      value: token.value
    });
  }
  parseDocument() {
    return this.node(this._lexer.token, {
      kind: Kind.DOCUMENT,
      definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF)
    });
  }
  parseDefinition() {
    if (this.peek(TokenKind.BRACE_L)) {
      return this.parseOperationDefinition();
    }
    const hasDescription = this.peekDescription();
    const keywordToken = hasDescription ? this._lexer.lookahead() : this._lexer.token;
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaDefinition();
        case "scalar":
          return this.parseScalarTypeDefinition();
        case "type":
          return this.parseObjectTypeDefinition();
        case "interface":
          return this.parseInterfaceTypeDefinition();
        case "union":
          return this.parseUnionTypeDefinition();
        case "enum":
          return this.parseEnumTypeDefinition();
        case "input":
          return this.parseInputObjectTypeDefinition();
        case "directive":
          return this.parseDirectiveDefinition();
      }
      if (hasDescription) {
        throw syntaxError(this._lexer.source, this._lexer.token.start, "Unexpected description, descriptions are supported only on type definitions.");
      }
      switch (keywordToken.value) {
        case "query":
        case "mutation":
        case "subscription":
          return this.parseOperationDefinition();
        case "fragment":
          return this.parseFragmentDefinition();
        case "extend":
          return this.parseTypeSystemExtension();
      }
    }
    throw this.unexpected(keywordToken);
  }
  parseOperationDefinition() {
    const start = this._lexer.token;
    if (this.peek(TokenKind.BRACE_L)) {
      return this.node(start, {
        kind: Kind.OPERATION_DEFINITION,
        operation: OperationTypeNode.QUERY,
        name: void 0,
        variableDefinitions: [],
        directives: [],
        selectionSet: this.parseSelectionSet()
      });
    }
    const operation = this.parseOperationType();
    let name;
    if (this.peek(TokenKind.NAME)) {
      name = this.parseName();
    }
    return this.node(start, {
      kind: Kind.OPERATION_DEFINITION,
      operation,
      name,
      variableDefinitions: this.parseVariableDefinitions(),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseOperationType() {
    const operationToken = this.expectToken(TokenKind.NAME);
    switch (operationToken.value) {
      case "query":
        return OperationTypeNode.QUERY;
      case "mutation":
        return OperationTypeNode.MUTATION;
      case "subscription":
        return OperationTypeNode.SUBSCRIPTION;
    }
    throw this.unexpected(operationToken);
  }
  parseVariableDefinitions() {
    return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
  }
  parseVariableDefinition() {
    return this.node(this._lexer.token, {
      kind: Kind.VARIABLE_DEFINITION,
      variable: this.parseVariable(),
      type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
      defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseConstValueLiteral() : void 0,
      directives: this.parseConstDirectives()
    });
  }
  parseVariable() {
    const start = this._lexer.token;
    this.expectToken(TokenKind.DOLLAR);
    return this.node(start, {
      kind: Kind.VARIABLE,
      name: this.parseName()
    });
  }
  parseSelectionSet() {
    return this.node(this._lexer.token, {
      kind: Kind.SELECTION_SET,
      selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R)
    });
  }
  parseSelection() {
    return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
  }
  parseField() {
    const start = this._lexer.token;
    const nameOrAlias = this.parseName();
    let alias;
    let name;
    if (this.expectOptionalToken(TokenKind.COLON)) {
      alias = nameOrAlias;
      name = this.parseName();
    } else {
      name = nameOrAlias;
    }
    return this.node(start, {
      kind: Kind.FIELD,
      alias,
      name,
      arguments: this.parseArguments(false),
      directives: this.parseDirectives(false),
      selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : void 0
    });
  }
  parseArguments(isConst) {
    const item = isConst ? this.parseConstArgument : this.parseArgument;
    return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
  }
  parseArgument(isConst = false) {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: Kind.ARGUMENT,
      name,
      value: this.parseValueLiteral(isConst)
    });
  }
  parseConstArgument() {
    return this.parseArgument(true);
  }
  parseFragment() {
    const start = this._lexer.token;
    this.expectToken(TokenKind.SPREAD);
    const hasTypeCondition = this.expectOptionalKeyword("on");
    if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
      return this.node(start, {
        kind: Kind.FRAGMENT_SPREAD,
        name: this.parseFragmentName(),
        directives: this.parseDirectives(false)
      });
    }
    return this.node(start, {
      kind: Kind.INLINE_FRAGMENT,
      typeCondition: hasTypeCondition ? this.parseNamedType() : void 0,
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseFragmentDefinition() {
    var _this$_options;
    const start = this._lexer.token;
    this.expectKeyword("fragment");
    if (((_this$_options = this._options) === null || _this$_options === void 0 ? void 0 : _this$_options.allowLegacyFragmentVariables) === true) {
      return this.node(start, {
        kind: Kind.FRAGMENT_DEFINITION,
        name: this.parseFragmentName(),
        variableDefinitions: this.parseVariableDefinitions(),
        typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
        directives: this.parseDirectives(false),
        selectionSet: this.parseSelectionSet()
      });
    }
    return this.node(start, {
      kind: Kind.FRAGMENT_DEFINITION,
      name: this.parseFragmentName(),
      typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseFragmentName() {
    if (this._lexer.token.value === "on") {
      throw this.unexpected();
    }
    return this.parseName();
  }
  parseValueLiteral(isConst) {
    const token = this._lexer.token;
    switch (token.kind) {
      case TokenKind.BRACKET_L:
        return this.parseList(isConst);
      case TokenKind.BRACE_L:
        return this.parseObject(isConst);
      case TokenKind.INT:
        this._lexer.advance();
        return this.node(token, {
          kind: Kind.INT,
          value: token.value
        });
      case TokenKind.FLOAT:
        this._lexer.advance();
        return this.node(token, {
          kind: Kind.FLOAT,
          value: token.value
        });
      case TokenKind.STRING:
      case TokenKind.BLOCK_STRING:
        return this.parseStringLiteral();
      case TokenKind.NAME:
        this._lexer.advance();
        switch (token.value) {
          case "true":
            return this.node(token, {
              kind: Kind.BOOLEAN,
              value: true
            });
          case "false":
            return this.node(token, {
              kind: Kind.BOOLEAN,
              value: false
            });
          case "null":
            return this.node(token, {
              kind: Kind.NULL
            });
          default:
            return this.node(token, {
              kind: Kind.ENUM,
              value: token.value
            });
        }
      case TokenKind.DOLLAR:
        if (isConst) {
          this.expectToken(TokenKind.DOLLAR);
          if (this._lexer.token.kind === TokenKind.NAME) {
            const varName = this._lexer.token.value;
            throw syntaxError(this._lexer.source, token.start, `Unexpected variable "$${varName}" in constant value.`);
          } else {
            throw this.unexpected(token);
          }
        }
        return this.parseVariable();
      default:
        throw this.unexpected();
    }
  }
  parseConstValueLiteral() {
    return this.parseValueLiteral(true);
  }
  parseStringLiteral() {
    const token = this._lexer.token;
    this._lexer.advance();
    return this.node(token, {
      kind: Kind.STRING,
      value: token.value,
      block: token.kind === TokenKind.BLOCK_STRING
    });
  }
  parseList(isConst) {
    const item = () => this.parseValueLiteral(isConst);
    return this.node(this._lexer.token, {
      kind: Kind.LIST,
      values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R)
    });
  }
  parseObject(isConst) {
    const item = () => this.parseObjectField(isConst);
    return this.node(this._lexer.token, {
      kind: Kind.OBJECT,
      fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R)
    });
  }
  parseObjectField(isConst) {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: Kind.OBJECT_FIELD,
      name,
      value: this.parseValueLiteral(isConst)
    });
  }
  parseDirectives(isConst) {
    const directives = [];
    while (this.peek(TokenKind.AT)) {
      directives.push(this.parseDirective(isConst));
    }
    return directives;
  }
  parseConstDirectives() {
    return this.parseDirectives(true);
  }
  parseDirective(isConst) {
    const start = this._lexer.token;
    this.expectToken(TokenKind.AT);
    return this.node(start, {
      kind: Kind.DIRECTIVE,
      name: this.parseName(),
      arguments: this.parseArguments(isConst)
    });
  }
  parseTypeReference() {
    const start = this._lexer.token;
    let type;
    if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
      const innerType = this.parseTypeReference();
      this.expectToken(TokenKind.BRACKET_R);
      type = this.node(start, {
        kind: Kind.LIST_TYPE,
        type: innerType
      });
    } else {
      type = this.parseNamedType();
    }
    if (this.expectOptionalToken(TokenKind.BANG)) {
      return this.node(start, {
        kind: Kind.NON_NULL_TYPE,
        type
      });
    }
    return type;
  }
  parseNamedType() {
    return this.node(this._lexer.token, {
      kind: Kind.NAMED_TYPE,
      name: this.parseName()
    });
  }
  peekDescription() {
    return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
  }
  parseDescription() {
    if (this.peekDescription()) {
      return this.parseStringLiteral();
    }
  }
  parseSchemaDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("schema");
    const directives = this.parseConstDirectives();
    const operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
    return this.node(start, {
      kind: Kind.SCHEMA_DEFINITION,
      description,
      directives,
      operationTypes
    });
  }
  parseOperationTypeDefinition() {
    const start = this._lexer.token;
    const operation = this.parseOperationType();
    this.expectToken(TokenKind.COLON);
    const type = this.parseNamedType();
    return this.node(start, {
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation,
      type
    });
  }
  parseScalarTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("scalar");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.SCALAR_TYPE_DEFINITION,
      description,
      name,
      directives
    });
  }
  parseObjectTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("type");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    return this.node(start, {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseImplementsInterfaces() {
    return this.expectOptionalKeyword("implements") ? this.delimitedMany(TokenKind.AMP, this.parseNamedType) : [];
  }
  parseFieldsDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
  }
  parseFieldDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseName();
    const args = this.parseArgumentDefs();
    this.expectToken(TokenKind.COLON);
    const type = this.parseTypeReference();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.FIELD_DEFINITION,
      description,
      name,
      arguments: args,
      type,
      directives
    });
  }
  parseArgumentDefs() {
    return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
  }
  parseInputValueDef() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    const type = this.parseTypeReference();
    let defaultValue;
    if (this.expectOptionalToken(TokenKind.EQUALS)) {
      defaultValue = this.parseConstValueLiteral();
    }
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.INPUT_VALUE_DEFINITION,
      description,
      name,
      type,
      defaultValue,
      directives
    });
  }
  parseInterfaceTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("interface");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    return this.node(start, {
      kind: Kind.INTERFACE_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseUnionTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("union");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const types = this.parseUnionMemberTypes();
    return this.node(start, {
      kind: Kind.UNION_TYPE_DEFINITION,
      description,
      name,
      directives,
      types
    });
  }
  parseUnionMemberTypes() {
    return this.expectOptionalToken(TokenKind.EQUALS) ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType) : [];
  }
  parseEnumTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("enum");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const values = this.parseEnumValuesDefinition();
    return this.node(start, {
      kind: Kind.ENUM_TYPE_DEFINITION,
      description,
      name,
      directives,
      values
    });
  }
  parseEnumValuesDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
  }
  parseEnumValueDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseEnumValueName();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.ENUM_VALUE_DEFINITION,
      description,
      name,
      directives
    });
  }
  parseEnumValueName() {
    if (this._lexer.token.value === "true" || this._lexer.token.value === "false" || this._lexer.token.value === "null") {
      throw syntaxError(this._lexer.source, this._lexer.token.start, `${getTokenDesc(this._lexer.token)} is reserved and cannot be used for an enum value.`);
    }
    return this.parseName();
  }
  parseInputObjectTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("input");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const fields = this.parseInputFieldsDefinition();
    return this.node(start, {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      description,
      name,
      directives,
      fields
    });
  }
  parseInputFieldsDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
  }
  parseTypeSystemExtension() {
    const keywordToken = this._lexer.lookahead();
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaExtension();
        case "scalar":
          return this.parseScalarTypeExtension();
        case "type":
          return this.parseObjectTypeExtension();
        case "interface":
          return this.parseInterfaceTypeExtension();
        case "union":
          return this.parseUnionTypeExtension();
        case "enum":
          return this.parseEnumTypeExtension();
        case "input":
          return this.parseInputObjectTypeExtension();
      }
    }
    throw this.unexpected(keywordToken);
  }
  parseSchemaExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("schema");
    const directives = this.parseConstDirectives();
    const operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
    if (directives.length === 0 && operationTypes.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.SCHEMA_EXTENSION,
      directives,
      operationTypes
    });
  }
  parseScalarTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("scalar");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    if (directives.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.SCALAR_TYPE_EXTENSION,
      name,
      directives
    });
  }
  parseObjectTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("type");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseInterfaceTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("interface");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.INTERFACE_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseUnionTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("union");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const types = this.parseUnionMemberTypes();
    if (directives.length === 0 && types.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.UNION_TYPE_EXTENSION,
      name,
      directives,
      types
    });
  }
  parseEnumTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("enum");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const values = this.parseEnumValuesDefinition();
    if (directives.length === 0 && values.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.ENUM_TYPE_EXTENSION,
      name,
      directives,
      values
    });
  }
  parseInputObjectTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("input");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const fields = this.parseInputFieldsDefinition();
    if (directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
      name,
      directives,
      fields
    });
  }
  parseDirectiveDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("directive");
    this.expectToken(TokenKind.AT);
    const name = this.parseName();
    const args = this.parseArgumentDefs();
    const repeatable = this.expectOptionalKeyword("repeatable");
    this.expectKeyword("on");
    const locations = this.parseDirectiveLocations();
    return this.node(start, {
      kind: Kind.DIRECTIVE_DEFINITION,
      description,
      name,
      arguments: args,
      repeatable,
      locations
    });
  }
  parseDirectiveLocations() {
    return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
  }
  parseDirectiveLocation() {
    const start = this._lexer.token;
    const name = this.parseName();
    if (Object.prototype.hasOwnProperty.call(DirectiveLocation, name.value)) {
      return name;
    }
    throw this.unexpected(start);
  }
  node(startToken, node) {
    var _this$_options2;
    if (((_this$_options2 = this._options) === null || _this$_options2 === void 0 ? void 0 : _this$_options2.noLocation) !== true) {
      node.loc = new Location(startToken, this._lexer.lastToken, this._lexer.source);
    }
    return node;
  }
  peek(kind) {
    return this._lexer.token.kind === kind;
  }
  expectToken(kind) {
    const token = this._lexer.token;
    if (token.kind === kind) {
      this._lexer.advance();
      return token;
    }
    throw syntaxError(this._lexer.source, token.start, `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token)}.`);
  }
  expectOptionalToken(kind) {
    const token = this._lexer.token;
    if (token.kind === kind) {
      this._lexer.advance();
      return true;
    }
    return false;
  }
  expectKeyword(value) {
    const token = this._lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this._lexer.advance();
    } else {
      throw syntaxError(this._lexer.source, token.start, `Expected "${value}", found ${getTokenDesc(token)}.`);
    }
  }
  expectOptionalKeyword(value) {
    const token = this._lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this._lexer.advance();
      return true;
    }
    return false;
  }
  unexpected(atToken) {
    const token = atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
    return syntaxError(this._lexer.source, token.start, `Unexpected ${getTokenDesc(token)}.`);
  }
  any(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    const nodes = [];
    while (!this.expectOptionalToken(closeKind)) {
      nodes.push(parseFn.call(this));
    }
    return nodes;
  }
  optionalMany(openKind, parseFn, closeKind) {
    if (this.expectOptionalToken(openKind)) {
      const nodes = [];
      do {
        nodes.push(parseFn.call(this));
      } while (!this.expectOptionalToken(closeKind));
      return nodes;
    }
    return [];
  }
  many(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    const nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (!this.expectOptionalToken(closeKind));
    return nodes;
  }
  delimitedMany(delimiterKind, parseFn) {
    this.expectOptionalToken(delimiterKind);
    const nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (this.expectOptionalToken(delimiterKind));
    return nodes;
  }
}
function getTokenDesc(token) {
  const value = token.value;
  return getTokenKindDesc(token.kind) + (value != null ? ` "${value}"` : "");
}
function getTokenKindDesc(kind) {
  return isPunctuatorTokenKind(kind) ? `"${kind}"` : kind;
}
var docCache = /* @__PURE__ */ new Map();
var fragmentSourceMap = /* @__PURE__ */ new Map();
var printFragmentWarnings = true;
var experimentalFragmentVariables = false;
function normalize(string) {
  return string.replace(/[\s,]+/g, " ").trim();
}
function cacheKeyFromLoc(loc) {
  return normalize(loc.source.body.substring(loc.start, loc.end));
}
function processFragments(ast) {
  var seenKeys = /* @__PURE__ */ new Set();
  var definitions = [];
  ast.definitions.forEach(function(fragmentDefinition) {
    if (fragmentDefinition.kind === "FragmentDefinition") {
      var fragmentName = fragmentDefinition.name.value;
      var sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);
      var sourceKeySet = fragmentSourceMap.get(fragmentName);
      if (sourceKeySet && !sourceKeySet.has(sourceKey)) {
        if (printFragmentWarnings) {
          console.warn("Warning: fragment with name " + fragmentName + " already exists.\ngraphql-tag enforces all fragment names across your application to be unique; read more about\nthis in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
        }
      } else if (!sourceKeySet) {
        fragmentSourceMap.set(fragmentName, sourceKeySet = /* @__PURE__ */ new Set());
      }
      sourceKeySet.add(sourceKey);
      if (!seenKeys.has(sourceKey)) {
        seenKeys.add(sourceKey);
        definitions.push(fragmentDefinition);
      }
    } else {
      definitions.push(fragmentDefinition);
    }
  });
  return __assign(__assign({}, ast), { definitions });
}
function stripLoc(doc) {
  var workSet = new Set(doc.definitions);
  workSet.forEach(function(node) {
    if (node.loc)
      delete node.loc;
    Object.keys(node).forEach(function(key) {
      var value = node[key];
      if (value && typeof value === "object") {
        workSet.add(value);
      }
    });
  });
  var loc = doc.loc;
  if (loc) {
    delete loc.startToken;
    delete loc.endToken;
  }
  return doc;
}
function parseDocument(source) {
  var cacheKey = normalize(source);
  if (!docCache.has(cacheKey)) {
    var parsed = parse(source, {
      experimentalFragmentVariables,
      allowLegacyFragmentVariables: experimentalFragmentVariables
    });
    if (!parsed || parsed.kind !== "Document") {
      throw new Error("Not a valid GraphQL document.");
    }
    docCache.set(cacheKey, stripLoc(processFragments(parsed)));
  }
  return docCache.get(cacheKey);
}
function gql(literals) {
  var args = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    args[_i - 1] = arguments[_i];
  }
  if (typeof literals === "string") {
    literals = [literals];
  }
  var result = literals[0];
  args.forEach(function(arg, i) {
    if (arg && arg.kind === "Document") {
      result += arg.loc.source.body;
    } else {
      result += arg;
    }
    result += literals[i + 1];
  });
  return parseDocument(result);
}
function resetCaches() {
  docCache.clear();
  fragmentSourceMap.clear();
}
function disableFragmentWarnings() {
  printFragmentWarnings = false;
}
function enableExperimentalFragmentVariables() {
  experimentalFragmentVariables = true;
}
function disableExperimentalFragmentVariables() {
  experimentalFragmentVariables = false;
}
var extras = {
  gql,
  resetCaches,
  disableFragmentWarnings,
  enableExperimentalFragmentVariables,
  disableExperimentalFragmentVariables
};
(function(gql_1) {
  gql_1.gql = extras.gql, gql_1.resetCaches = extras.resetCaches, gql_1.disableFragmentWarnings = extras.disableFragmentWarnings, gql_1.enableExperimentalFragmentVariables = extras.enableExperimentalFragmentVariables, gql_1.disableExperimentalFragmentVariables = extras.disableExperimentalFragmentVariables;
})(gql || (gql = {}));
gql["default"] = gql;
var gql$1 = gql;
class GraphDataProvider extends ADataProvider {
  constructor(apollo, resource, options) {
    super(options);
    __publicField(this, "apolloClient");
    __publicField(this, "resource");
    this.apolloClient = apollo;
    this.resource = resource;
  }
  getData(page, limit, searchKeyword, filter, order) {
    return new Promise((resolve, reject) => {
      const query = this.getQuery(page, limit, filter, order);
      const variables = {
        offset: limit * page,
        limit
      };
      const graphqlQuery = gql$1`${query}`;
      this.apolloClient.query({
        fetchPolicy: "no-cache",
        query: graphqlQuery,
        variables
      }).then((result) => {
        if (!result.loading) {
          if (result.error) {
            const err = {
              name: "graphql query from vue-ui-grid",
              query,
              error: result.error,
              message: result.error
            };
            return reject(err);
          }
          const data = result.data;
          if (data && data[this.resource]) {
            let total = data[this.resource].length;
            if (this.options.graphqlDataCounter && this.options.resourceMeta) {
              total = this.options.graphqlDataCounter(data[this.options.resourceMeta]);
            }
            const res = {
              query,
              items: data[this.resource],
              total
            };
            resolve(res);
          }
        }
      });
    });
  }
  getGraphColumn() {
    const cols = this.options.columns.filter((col) => !["custom", "query"].includes(col.type));
    const normalCols = cols.filter((col) => !col.field.match(/\./));
    const refColumn = cols.filter((col) => col.field.match(/\./));
    const normalQuery = normalCols.filter((col) => !col.field.match(/\./)).map((col) => col.field).join("\n");
    const refQuery = this.getRefQuery(refColumn);
    return `
    ${normalQuery}
    ${refQuery}
    `;
  }
  getSearchQuery(filter) {
    let search = [];
    if (filter) {
      const where = __spreadValues({}, filter);
      const normalKeys = Object.keys(where).filter((key) => !key.match(/\./));
      const refKeys = Object.keys(where).filter((key) => key.match(/\./));
      const normalSearch = normalKeys.map((key) => {
        const cfilter = this.getFilter(key, where[key]);
        return where[key] ? `${cfilter}` : "";
      }).filter((s) => s).join("");
      const refFilters = refKeys.map((key) => {
        return {
          key,
          value: where[key]
        };
      });
      const refSearch = this.getRefFilter(refFilters);
      search = [
        normalSearch,
        refSearch
      ];
    }
    return search.join("\n");
  }
  getOrderQuery(order) {
    if (this.options.graphqlOrder && order && order.by) {
      return this.options.graphqlOrder(order.by, order.type);
    }
    return "";
  }
  getQuery(page, limit, filter, order) {
    const orderQuery = this.getOrderQuery(order);
    const searchQuery = this.getSearchQuery(filter);
    const graphColumn = this.getGraphColumn();
    const query = `
      query getData($offset: Int!, $limit: Int!) {
        ${this.resource}_aggregate (
          ${this.options.filterKey}: {
            ${this.options.refFilter}
            ${searchQuery}
          }
          ${orderQuery}
        ) {
          ${this.options.aggregateQuery}
        }
        ${this.resource} (
          ${this.options.offsetKey}: $offset,
          ${this.options.limitKey}: $limit,
          ${this.options.filterKey}: {
            ${this.options.refFilter}
            ${searchQuery}
          }
          ${orderQuery}
        ) {
          ${graphColumn}
        }
      }
    `;
    return query;
  }
  getFilter(columnKey, receivedValue) {
    let value = receivedValue;
    if (typeof receivedValue === "string") {
      value = receivedValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }
    const column = this.options.columns.find((c) => c.field === columnKey);
    if (this.options.graphqlFilter && column && value) {
      return this.options.graphqlFilter(column.field, column.field_type, value, column.filter_type);
    }
    return "";
  }
  getRefQuery(columns) {
    const fields = columns.map((c) => c.field).map((field) => field.split("."));
    const tree = {};
    fields.forEach((row) => {
      row.reduce((acc, curr) => {
        if (!acc[curr]) {
          acc[curr] = {};
        }
        return acc[curr];
      }, tree);
    });
    return this.getRefQueryByNode(tree, true);
  }
  getRefQueryByNode(node, isRoot = false) {
    const keys = Object.keys(node);
    if (keys.length) {
      const q = keys.map((key) => {
        return `
          ${key} ${this.getRefQueryByNode(node[key])}
        `;
      }).join("\n");
      return isRoot ? q : `{ ${q} }`;
    }
    return "";
  }
  getRefFilter(filters) {
    if (!filters || !filters.length) {
      return "";
    }
    const tree = {};
    filters.forEach((filter) => {
      const column = this.options.columns.find((c) => c.field === filter.key);
      const fields = filter.key.split(".");
      const len = fields.length;
      fields.reduce((acc, curr, index) => {
        let filterValue = {};
        if (index === len - 1) {
          filterValue = filter.value;
          if (this.options.graphqlFilter && column && filter.value) {
            filterValue = this.options.graphqlFilter(curr, column.field_type, filter.value, column.filter_type);
          }
        }
        if (!acc[curr]) {
          acc[curr] = filterValue;
        }
        return acc[curr];
      }, tree);
    });
    return this.getRefFilterByNode(tree, true);
  }
  getRefFilterByNode(node, isRoot = false) {
    if (typeof node === "object") {
      const keys = Object.keys(node);
      if (keys.length) {
        const q = keys.map((key) => {
          if (typeof node[key] === "object") {
            return `
              ${key}: ${this.getRefFilterByNode(node[key])}
            `;
          }
          return this.getRefFilterByNode(node[key]);
        }).join("\n");
        return isRoot ? q : `{ ${q} }`;
      }
    }
    return node;
  }
}
function useOption(props) {
  const vGridOptions = inject("$vgrid", {
    debug: false,
    pageKey: "page"
  });
  return computed(() => ({
    debug: vGridOptions.debug,
    pageKey: vGridOptions.pageKey,
    searchable: props.searchable,
    searchField: props.searchField,
    orderable: props.orderable,
    filterable: props.filterable,
    columnFilterable: props.columnFilterable,
    columnVisible: props.columnVisible,
    statusable: props.statusable,
    pagination: props.pagination,
    exportable: props.exportable,
    columns: props.columns
  }));
}
function useJsonData(props, option, dataCallback) {
  const baseOptions = useOption(props);
  const gridOption = computed(() => __spreadValues(__spreadValues({}, baseOptions.value), option));
  const dataProvider = new JsonDataProvider(props.data, gridOption.value);
  const setDataCollections = () => {
    dataProvider.updateData(props.data);
    dataCallback();
  };
  watch(() => props.data, () => {
    setDataCollections();
  });
  return {
    dataProvider,
    gridOption,
    setDataCollections
  };
}
function useLocalValue(props, emit) {
  return computed({
    get: () => {
      return props.modelValue;
    },
    set: (value) => {
      emit(`update:modelValue`, value);
    }
  });
}
const _hoisted_1$p = {
  key: 0,
  class: "vgrid-pagination"
};
const _hoisted_2$j = ["onClick", "innerHTML"];
const _sfc_main$u = /* @__PURE__ */ defineComponent({
  name: "Pagination",
  props: {
    modelValue: null,
    limit: { default: 10 },
    total: { default: 0 }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const totalPage = computed(() => {
      if (!(props.total % props.limit)) {
        return props.total / props.limit;
      }
      return Math.floor(props.total / props.limit) + 1;
    });
    const pages = computed(() => {
      const step = [-2, -1, 0, 1, 2].map((i) => i + localValue.value);
      const result = [
        {
          label: "&laquo;",
          page: localValue.value - 1,
          disable: localValue.value === 0
        }
      ];
      for (const i of step) {
        if (i >= 0 && i < totalPage.value) {
          if (i === 0) {
            result.push({
              label: "1",
              page: 0
            });
          } else if (i === localValue.value) {
            result.push({
              label: i + 1,
              page: i
            });
          } else {
            result.push({
              label: i + 1,
              page: i
            });
          }
        }
      }
      result.push({
        label: "&raquo;",
        page: localValue.value + 1,
        disable: localValue.value === totalPage.value - 1
      });
      if (totalPage.value > 5) {
        if (localValue.value > 2) {
          result.splice(1, 0, {
            label: "1..",
            page: 0
          });
        }
        if (localValue.value < totalPage.value - 3) {
          result.splice(result.length - 1, 0, {
            label: `..${totalPage.value}`,
            page: totalPage.value - 1
          });
        }
      }
      return result;
    });
    const onPageChange = (page) => {
      localValue.value = page;
    };
    return (_ctx, _cache) => {
      return unref(totalPage) > 1 ? (openBlock(), createElementBlock("nav", _hoisted_1$p, [
        createElementVNode("ul", null, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(pages), (item, index) => {
            return openBlock(), createElementBlock("li", {
              class: normalizeClass({ active: item.page === unref(localValue), disabled: item.disable }),
              key: index
            }, [
              createElementVNode("a", {
                href: "javascript:;",
                onClick: ($event) => onPageChange(item.page),
                innerHTML: item.label
              }, null, 8, _hoisted_2$j)
            ], 2);
          }), 128))
        ])
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$o = {
  key: 0,
  class: "vgrid-pagination vgrid-pagination--cursor"
};
const _hoisted_2$i = ["onClick", "innerHTML", "title"];
const _sfc_main$t = /* @__PURE__ */ defineComponent({
  name: "CursorPagination",
  props: {
    modelValue: null,
    meta: { default: {} }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const pages = computed(() => {
      var _a, _b, _c, _d;
      return [
        {
          label: "&lsaquo;",
          page: (_a = props.meta) == null ? void 0 : _a.prev_cursor,
          disable: !((_b = props.meta) == null ? void 0 : _b.prev_cursor),
          title: "Previous"
        },
        {
          label: "&rsaquo;",
          page: (_c = props.meta) == null ? void 0 : _c.next_cursor,
          disable: !((_d = props.meta) == null ? void 0 : _d.next_cursor),
          title: "Next"
        }
      ];
    });
    const onPageChange = (page) => {
      localValue.value = page;
    };
    return (_ctx, _cache) => {
      return __props.meta ? (openBlock(), createElementBlock("nav", _hoisted_1$o, [
        createElementVNode("ul", null, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(pages), (item, index) => {
            return openBlock(), createElementBlock("li", {
              class: normalizeClass({ disabled: item.disable }),
              key: index
            }, [
              createElementVNode("a", {
                href: "javascript:;",
                onClick: ($event) => onPageChange(item.page),
                innerHTML: item.label,
                title: item.title
              }, null, 8, _hoisted_2$i)
            ], 2);
          }), 128))
        ])
      ])) : createCommentVNode("", true);
    };
  }
});
function getData(field, columnData) {
  if (!columnData) {
    return "";
  }
  const fields = field.split(".");
  const res = fields.reduce((acc, curr, index) => {
    return acc[curr] || (index < fields.length - 1 ? {} : null);
  }, columnData);
  return res ? res : "";
}
function useColumnType(props) {
  const text = computed(() => {
    if (props.column.format) {
      if (typeof props.column.format === "function") {
        return props.column.format(props.data);
      } else {
        return props.column.format.replace(/\{(\w*)\}/g, (matched, field) => {
          return getData(field, props.data);
        });
      }
    }
    return getData(props.column.field, props.data);
  });
  const classes = computed(() => {
    const type = props.column.type || "text";
    const { field } = props.column;
    const result = [
      `vgrid-column-type--${type}`,
      `vgrid-column-data--${field}`
    ];
    if (props.resize && props.column.width) {
      result.push(`vgrid-field--${props.column.width}`);
    }
    if (props.column.class) {
      result.push(props.column.class);
    }
    return result;
  });
  return {
    text,
    classes
  };
}
const _hoisted_1$n = ["innerHTML"];
const _sfc_main$s = /* @__PURE__ */ defineComponent({
  name: "Basic",
  props: {
    column: null,
    data: null,
    resize: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const { text, classes } = useColumnType(props);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-field", unref(classes)])
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          createElementVNode("span", { innerHTML: unref(text) }, null, 8, _hoisted_1$n)
        ])
      ], 2);
    };
  }
});
const _sfc_main$r = /* @__PURE__ */ defineComponent({
  name: "DateTime",
  props: {
    column: null,
    data: null,
    resize: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const { text, classes } = useColumnType(props);
    const date = computed(() => text.value);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-field", unref(classes)])
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          createElementVNode("span", null, toDisplayString(unref(date)), 1)
        ])
      ], 2);
    };
  }
});
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  name: "Timestamp",
  props: {
    column: null,
    data: null,
    resize: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const { text, classes } = useColumnType(props);
    const timestamp = computed(() => text.value);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-field", unref(classes)])
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          createElementVNode("span", null, toDisplayString(unref(timestamp)), 1)
        ])
      ], 2);
    };
  }
});
const _hoisted_1$m = ["innerHTML"];
const _sfc_main$p = /* @__PURE__ */ defineComponent({
  name: "Custom",
  props: {
    column: null,
    data: null,
    resize: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const { text, classes } = useColumnType(props);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-field", unref(classes)])
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          createElementVNode("span", { innerHTML: unref(text) }, null, 8, _hoisted_1$m)
        ])
      ], 2);
    };
  }
});
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  name: "ColumnType",
  props: {
    column: null,
    data: null,
    resize: { type: Boolean }
  },
  setup(__props) {
    const generateFieldByType = (ctype) => {
      let columnLayout = _sfc_main$s;
      switch (ctype) {
        case "datetime":
          columnLayout = _sfc_main$r;
          break;
        case "timestamp":
          columnLayout = _sfc_main$q;
          break;
        case "custom":
          columnLayout = _sfc_main$p;
          break;
      }
      return columnLayout;
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(generateFieldByType(__props.column.type)), {
        column: __props.column,
        data: __props.data,
        resize: __props.resize
      }, {
        default: withCtx(() => [
          renderSlot(_ctx.$slots, "default")
        ]),
        _: 3
      }, 8, ["column", "data", "resize"]);
    };
  }
});
function useColumnFilter(props) {
  const classes = computed(() => {
    const type = props.column.type || "text";
    const { field } = props.column;
    return [`vgrid-column-type--${type}`, `vgrid-column-data--${field}`];
  });
  return {
    classes
  };
}
const _hoisted_1$l = { class: "vgrid-text-input" };
const _hoisted_2$h = ["value", "placeholder"];
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  name: "TextInput",
  props: {
    modelValue: { default: "" },
    placeholder: { default: "" },
    clearable: { type: Boolean, default: true }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const input = ref(null);
    const typing = ref(false);
    const timeout = ref(null);
    const hasClearable = computed(() => props.clearable && props.modelValue);
    const clearFilter = () => {
      localValue.value = "";
    };
    const onChange = (event) => {
      typing.value = true;
      if (timeout.value) {
        clearTimeout(timeout.value);
      }
      timeout.value = setTimeout(() => {
        const value = event.target.value;
        localValue.value = value;
        typing.value = false;
      }, 500);
    };
    const focus = async () => {
      await nextTick(() => {
        if (input.value) {
          const el = input.value;
          el.focus();
        }
      });
    };
    expose({
      focus
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$l, [
        createElementVNode("input", {
          class: normalizeClass(["vgrid-input", { "vgrid-input--active": unref(localValue) }]),
          ref_key: "input",
          ref: input,
          type: "text",
          value: unref(localValue),
          placeholder: __props.placeholder,
          onInput: onChange
        }, null, 42, _hoisted_2$h),
        unref(hasClearable) ? (openBlock(), createElementBlock("a", {
          key: 0,
          class: "vgrid-input-clear",
          href: "javascript:;",
          onClick: clearFilter
        }, "\xD7")) : createCommentVNode("", true)
      ]);
    };
  }
});
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  name: "Basic",
  props: {
    modelValue: null,
    column: null
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const { classes } = useColumnFilter(props);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-column-filter", unref(classes)])
      }, [
        createVNode(_sfc_main$n, {
          modelValue: unref(localValue),
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(localValue) ? localValue.value = $event : null)
        }, null, 8, ["modelValue"])
      ], 2);
    };
  }
});
const _hoisted_1$k = /* @__PURE__ */ createElementVNode("option", { value: "" }, "Clear selected", -1);
const _hoisted_2$g = ["value"];
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  name: "Dropdown",
  props: {
    modelValue: null,
    column: null
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const { classes } = useColumnFilter(props);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-column-filter", unref(classes)])
      }, [
        withDirectives(createElementVNode("select", {
          class: "vgrid-input",
          ref: "input",
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(localValue) ? localValue.value = $event : null)
        }, [
          _hoisted_1$k,
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.column.filter_value, (value) => {
            return openBlock(), createElementBlock("option", {
              value: value.id + ""
            }, toDisplayString(value.label), 9, _hoisted_2$g);
          }), 256))
        ], 512), [
          [vModelSelect, unref(localValue)]
        ])
      ], 2);
    };
  }
});
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  name: "ColumnFilter",
  props: {
    column: null
  },
  setup(__props) {
    const generateFieldByType = (ftype) => {
      let filterLayout = _sfc_main$m;
      switch (ftype) {
        case "dropdown":
          filterLayout = _sfc_main$l;
          break;
      }
      return filterLayout;
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(generateFieldByType(__props.column.filter_type)), { column: __props.column }, null, 8, ["column"]);
    };
  }
});
function useFilter(props, localValue, el = {}) {
  const isEditor = ref(false);
  const stopClick = () => ({});
  const classes = computed(() => {
    const type = props.column.type || "text";
    const { field } = props.column;
    const result = [`vgrid-column-type--${type}`, `vgrid-column-data--${field}`];
    if (localValue.value) {
      result.push("active");
    }
    return result;
  });
  const placeholder = computed(() => {
    return `Find ${props.column.label}`;
  });
  const showEditor = () => {
    document.dispatchEvent(new Event("vgrid-filter-editor"));
    isEditor.value = true;
    if (el && el.value) {
      setTimeout(() => {
        el.value.focus();
      }, 100);
    }
  };
  const onEnter = () => {
    isEditor.value = false;
  };
  const handleBodyClick = () => {
    isEditor.value = false;
  };
  onMounted(() => {
    document.body.addEventListener("click", handleBodyClick);
    document.addEventListener("vgrid-filter-editor", handleBodyClick);
  });
  onBeforeUnmount(() => {
    document.body.removeEventListener("click", handleBodyClick);
    document.removeEventListener("vgrid-filter-editor", handleBodyClick);
  });
  return {
    isEditor,
    stopClick,
    classes,
    placeholder,
    showEditor,
    onEnter
  };
}
const _hoisted_1$j = { class: "vgrid-filter-value" };
const _hoisted_2$f = { class: "vgrid-label--prefix" };
const _hoisted_3$f = { class: "vgrid-filter-editor" };
const _hoisted_4$f = { class: "vgrid-filter-label" };
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  name: "Basic",
  props: {
    modelValue: null,
    column: null
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const input = ref();
    const {
      isEditor,
      stopClick,
      classes,
      placeholder,
      showEditor,
      onEnter
    } = useFilter(props, localValue, input);
    const valueInString = computed(() => localValue.value || "Any");
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-filter-item", unref(classes)]),
        onClick: _cache[2] || (_cache[2] = withModifiers((...args) => unref(stopClick) && unref(stopClick)(...args), ["stop"]))
      }, [
        createElementVNode("div", {
          class: normalizeClass(["vgrid-filter-handle", { active: unref(isEditor), "vgrid-input--active": unref(localValue) }]),
          onClick: _cache[0] || (_cache[0] = (...args) => unref(showEditor) && unref(showEditor)(...args))
        }, [
          createElementVNode("span", _hoisted_1$j, [
            createElementVNode("span", _hoisted_2$f, toDisplayString(__props.column.label) + ":\xA0", 1),
            createElementVNode("strong", null, toDisplayString(unref(valueInString)), 1)
          ])
        ], 2),
        withDirectives(createElementVNode("div", _hoisted_3$f, [
          createElementVNode("span", _hoisted_4$f, toDisplayString(__props.column.label) + ":", 1),
          createVNode(_sfc_main$n, {
            class: "vgrid-input-sm",
            ref_key: "input",
            ref: input,
            placeholder: unref(placeholder),
            modelValue: unref(localValue),
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => isRef(localValue) ? localValue.value = $event : null),
            onEnter: unref(onEnter)
          }, null, 8, ["placeholder", "modelValue", "onEnter"])
        ], 512), [
          [vShow, unref(isEditor)]
        ])
      ], 2);
    };
  }
});
const _hoisted_1$i = { class: "vgrid-filter-value" };
const _hoisted_2$e = { class: "vgrid-label--prefix" };
const _hoisted_3$e = { class: "vgrid-filter-editor" };
const _hoisted_4$e = { class: "vgrid-filter-label" };
const _hoisted_5$d = /* @__PURE__ */ createElementVNode("option", { value: "" }, "Select a value", -1);
const _hoisted_6$c = ["value"];
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  name: "Dropdown",
  props: {
    modelValue: null,
    column: null
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const input = ref(null);
    const {
      isEditor,
      stopClick,
      classes,
      placeholder,
      showEditor,
      onEnter
    } = useFilter(props, localValue, input);
    const valueInString = computed(() => {
      if (localValue.value) {
        const v = props.column.filter_value.find((f) => f.id == localValue.value);
        return v ? v.label : localValue.value;
      }
      return "Any";
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-filter-item", unref(classes)]),
        onClick: _cache[2] || (_cache[2] = withModifiers((...args) => unref(stopClick) && unref(stopClick)(...args), ["stop"]))
      }, [
        createElementVNode("div", {
          class: normalizeClass(["vgrid-filter-handle", { active: unref(isEditor), "vgrid-input--active": unref(localValue) }]),
          onClick: _cache[0] || (_cache[0] = (...args) => unref(showEditor) && unref(showEditor)(...args))
        }, [
          createElementVNode("span", _hoisted_1$i, [
            createElementVNode("span", _hoisted_2$e, toDisplayString(__props.column.label) + ":\xA0", 1),
            createElementVNode("strong", null, toDisplayString(unref(valueInString)), 1)
          ])
        ], 2),
        withDirectives(createElementVNode("div", _hoisted_3$e, [
          createElementVNode("span", _hoisted_4$e, toDisplayString(__props.column.label) + ":", 1),
          withDirectives(createElementVNode("select", {
            class: "vgrid-input",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => isRef(localValue) ? localValue.value = $event : null)
          }, [
            _hoisted_5$d,
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.column.filter_value, (value) => {
              return openBlock(), createElementBlock("option", {
                value: value.id + ""
              }, toDisplayString(value.label), 9, _hoisted_6$c);
            }), 256))
          ], 512), [
            [vModelSelect, unref(localValue)]
          ])
        ], 512), [
          [vShow, unref(isEditor)]
        ])
      ], 2);
    };
  }
});
function uniqueId(prefix) {
  const p = prefix ? `${prefix}` : "vgrid";
  const rand = Math.floor(1e5 + Math.random() * 9e5);
  return `${p}-${rand}`;
}
const _hoisted_1$h = { class: "vgrid-filter-value" };
const _hoisted_2$d = { class: "vgrid-label--prefix" };
const _hoisted_3$d = { class: "vgrid-filter-editor" };
const _hoisted_4$d = { class: "vgrid-filter-label" };
const _hoisted_5$c = { class: "form-check" };
const _hoisted_6$b = ["value", "id"];
const _hoisted_7$b = ["for"];
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  name: "Checkbox",
  props: {
    modelValue: null,
    column: null
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    computed(() => uniqueId("vgrid-checkbox-"));
    const {
      isEditor,
      stopClick,
      classes,
      placeholder,
      showEditor,
      onEnter
    } = useFilter(props, localValue);
    const valueInString = computed(() => {
      if (localValue.value && localValue.value.length) {
        const data = props.column.filter_value.filter((f) => localValue.value.indexOf(f.id.toString()) !== -1).map((f) => f.label).join(", ");
        return data;
      }
      return "Any";
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-filter-item", unref(classes)]),
        onClick: _cache[2] || (_cache[2] = withModifiers((...args) => unref(stopClick) && unref(stopClick)(...args), ["stop"]))
      }, [
        createElementVNode("div", {
          class: normalizeClass(["vgrid-filter-handle", { active: unref(isEditor), "vgrid-input--active": unref(localValue) }]),
          onClick: _cache[0] || (_cache[0] = (...args) => unref(showEditor) && unref(showEditor)(...args))
        }, [
          createElementVNode("span", _hoisted_1$h, [
            createElementVNode("span", _hoisted_2$d, toDisplayString(__props.column.label) + ":\xA0", 1),
            createElementVNode("strong", null, toDisplayString(unref(valueInString)), 1)
          ])
        ], 2),
        withDirectives(createElementVNode("div", _hoisted_3$d, [
          createElementVNode("span", _hoisted_4$d, toDisplayString(__props.column.label) + ":", 1),
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.column.filter_value, (value) => {
            return openBlock(), createElementBlock("div", _hoisted_5$c, [
              withDirectives(createElementVNode("input", {
                class: "form-check-input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => isRef(localValue) ? localValue.value = $event : null),
                value: value.id + "",
                id: __props.column.field + "-" + value.id,
                type: "checkbox"
              }, null, 8, _hoisted_6$b), [
                [vModelCheckbox, unref(localValue)]
              ]),
              createElementVNode("label", {
                class: "form-check-label",
                for: __props.column.field + "-" + value.id
              }, toDisplayString(value.label), 9, _hoisted_7$b)
            ]);
          }), 256))
        ], 512), [
          [vShow, unref(isEditor)]
        ])
      ], 2);
    };
  }
});
const _hoisted_1$g = { class: "vgrid-filter-value" };
const _hoisted_2$c = { class: "vgrid-label--prefix" };
const _hoisted_3$c = { class: "vgrid-filter-editor" };
const _hoisted_4$c = { class: "vgrid-filter-label" };
const _hoisted_5$b = { class: "form-check" };
const _hoisted_6$a = ["name", "value", "id"];
const _hoisted_7$a = ["for"];
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  name: "Radio",
  props: {
    modelValue: null,
    column: null
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const input = ref(null);
    const elName = computed(() => uniqueId("vgrid-radio-"));
    const {
      isEditor,
      stopClick,
      classes,
      placeholder,
      showEditor,
      onEnter
    } = useFilter(props, localValue, input);
    const valueInString = computed(() => {
      if (localValue.value) {
        const v = props.column.filter_value.find((f) => f.id == localValue.value);
        return v ? v.label : localValue.value;
      }
      return "Any";
    });
    const clearFilter = () => {
      localValue.value = "";
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid-filter-item", unref(classes)]),
        onClick: _cache[2] || (_cache[2] = withModifiers((...args) => unref(stopClick) && unref(stopClick)(...args), ["stop"]))
      }, [
        createElementVNode("div", {
          class: normalizeClass(["vgrid-filter-handle", { active: unref(isEditor), "vgrid-input--active": unref(localValue) }]),
          onClick: _cache[0] || (_cache[0] = (...args) => unref(showEditor) && unref(showEditor)(...args))
        }, [
          createElementVNode("span", _hoisted_1$g, [
            createElementVNode("span", _hoisted_2$c, toDisplayString(__props.column.label) + ":\xA0", 1),
            createElementVNode("strong", null, toDisplayString(unref(valueInString)), 1)
          ])
        ], 2),
        withDirectives(createElementVNode("div", _hoisted_3$c, [
          createElementVNode("span", _hoisted_4$c, toDisplayString(__props.column.label) + ":", 1),
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.column.filter_value, (value) => {
            return openBlock(), createElementBlock("div", _hoisted_5$b, [
              withDirectives(createElementVNode("input", {
                class: "form-check-input",
                name: unref(elName),
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => isRef(localValue) ? localValue.value = $event : null),
                value: value.id + "",
                id: __props.column.field + "-" + value.id,
                type: "radio"
              }, null, 8, _hoisted_6$a), [
                [vModelRadio, unref(localValue)]
              ]),
              createElementVNode("label", {
                class: "form-check-label",
                for: __props.column.field + "-" + value.id
              }, toDisplayString(value.label), 9, _hoisted_7$a)
            ]);
          }), 256)),
          createElementVNode("div", { class: "text-center mt-2" }, [
            createElementVNode("button", {
              class: "btn btn-sm",
              type: "button",
              onClick: clearFilter
            }, "Clear")
          ])
        ], 512), [
          [vShow, unref(isEditor)]
        ])
      ], 2);
    };
  }
});
const _hoisted_1$f = { class: "vgrid-filter" };
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  name: "Filter",
  props: {
    modelValue: { default: {} },
    columns: { default: () => [] }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const generateFieldByType = (ftype) => {
      let filterItem = _sfc_main$j;
      switch (ftype) {
        case "dropdown":
          filterItem = _sfc_main$i;
          break;
        case "checkbox":
          filterItem = _sfc_main$h;
          break;
        case "radio":
          filterItem = _sfc_main$g;
          break;
      }
      return filterItem;
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$f, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.columns, (col) => {
          return openBlock(), createElementBlock(Fragment, {
            key: col.id
          }, [
            col.filter ? (openBlock(), createBlock(resolveDynamicComponent(generateFieldByType(col.filter_type)), {
              key: 0,
              column: col,
              modelValue: unref(localValue)[col.field],
              "onUpdate:modelValue": ($event) => unref(localValue)[col.field] = $event
            }, null, 8, ["column", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true)
          ], 64);
        }), 128))
      ]);
    };
  }
});
const _hoisted_1$e = { class: "vgrid-order" };
const _hoisted_2$b = { class: "vgrid-select" };
const _hoisted_3$b = ["value"];
const _hoisted_4$b = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-label--prefix" }, "Sort:", -1);
const _hoisted_5$a = ["onClick"];
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  name: "Order",
  props: {
    modelValue: { default: () => ({
      by: "",
      type: "desc"
    }) },
    columns: { default: () => [] },
    hasSortType: { type: Boolean, default: true }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const order = computed({
      get: () => ({
        by: props.modelValue ? props.modelValue.by : "",
        type: props.modelValue ? props.modelValue.type : "desc"
      }),
      set: (newVal) => {
        emits("update:modelValue", newVal);
      }
    });
    const orderBy = computed({
      get: () => {
        return order.value.by;
      },
      set: (newVal) => {
        order.value = __spreadProps(__spreadValues({}, order.value), {
          by: newVal
        });
      }
    });
    const orderedColumn = computed(() => {
      if (!props.columns) {
        return null;
      }
      return props.columns.find((c) => c.field === order.value.by) || {};
    });
    const orderableColumn = computed(() => props.columns.filter((c) => c.order));
    const toggleType = () => {
      order.value = __spreadProps(__spreadValues({}, order.value), {
        type: order.value.type === "desc" ? "asc" : "desc"
      });
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$e, [
        createElementVNode("div", _hoisted_2$b, [
          withDirectives(createElementVNode("select", {
            class: "vgrid-input",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(orderBy) ? orderBy.value = $event : null)
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(orderableColumn), (col) => {
              return openBlock(), createElementBlock("option", {
                value: col.field
              }, toDisplayString(col.label), 9, _hoisted_3$b);
            }), 256))
          ], 512), [
            [vModelSelect, unref(orderBy)]
          ]),
          createElementVNode("label", null, [
            _hoisted_4$b,
            createElementVNode("strong", null, toDisplayString(unref(orderedColumn).label), 1)
          ])
        ]),
        __props.hasSortType ? (openBlock(), createElementBlock("button", {
          key: 0,
          class: "vgrid-order-type",
          onClick: withModifiers(toggleType, ["stop"])
        }, toDisplayString(unref(order).type), 9, _hoisted_5$a)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$d = { class: "vgrid-size" };
const _hoisted_2$a = /* @__PURE__ */ createElementVNode("span", null, "Show", -1);
const _hoisted_3$a = ["value"];
const _hoisted_4$a = /* @__PURE__ */ createElementVNode("span", null, "entries", -1);
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  name: "PageSize",
  props: {
    modelValue: null,
    sizes: { default: () => [5, 10, 20, 50, 100] }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$d, [
        _hoisted_2$a,
        withDirectives(createElementVNode("select", {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(localValue) ? localValue.value = $event : null)
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.sizes, (s, index) => {
            return openBlock(), createElementBlock("option", {
              value: s,
              key: index
            }, toDisplayString(s), 9, _hoisted_3$a);
          }), 128))
        ], 512), [
          [vModelSelect, unref(localValue)]
        ]),
        _hoisted_4$a
      ]);
    };
  }
});
const _hoisted_1$c = ["onClick"];
const _hoisted_2$9 = /* @__PURE__ */ createElementVNode("span", null, "Columns visibility", -1);
const _hoisted_3$9 = [
  _hoisted_2$9
];
const _hoisted_4$9 = { class: "vgrid-visibility-body" };
const _hoisted_5$9 = ["id", "value"];
const _hoisted_6$9 = ["for"];
const _hoisted_7$9 = ["onClick"];
const _hoisted_8$9 = ["onClick"];
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  name: "ColumnsVisibility",
  props: {
    modelValue: { default: () => ({}) },
    columns: { default: () => [] }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const showVisibility = ref(false);
    const tempValue = ref([]);
    const columnData = ref([]);
    watch(() => tempValue.value, () => {
      updateValue();
    });
    const toggleVisibility = () => {
      showVisibility.value = !showVisibility.value;
    };
    const updateValue = () => {
      localValue.value = calculateValue();
    };
    const stopClick = () => ({});
    const initialize = () => {
      columnData.value = [...props.columns];
      tempValue.value = localValue.value;
    };
    const moveUp = (index) => {
      if (index < props.columns.length - 1) {
        const from = index;
        const to = index + 1;
        columnData.value.splice(to, 0, columnData.value.splice(from, 1)[0]);
        updateValue();
      }
    };
    const moveDown = (index) => {
      if (index > 0) {
        const from = index;
        const to = index - 1;
        columnData.value.splice(to, 0, columnData.value.splice(from, 1)[0]);
        updateValue();
      }
    };
    const calculateValue = () => {
      return columnData.value.filter((c) => tempValue.value.includes(c.field)).map((c) => c.field);
    };
    const handleBodyClick = () => {
      showVisibility.value = false;
    };
    onMounted(() => {
      document.body.addEventListener("click", handleBodyClick);
      initialize();
    });
    onBeforeUnmount(() => {
      document.body.removeEventListener("click", handleBodyClick);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "vgrid-visibility",
        onClick: withModifiers(stopClick, ["stop"])
      }, [
        createElementVNode("button", {
          class: "vgrid-visibility-button",
          type: "button",
          onClick: toggleVisibility
        }, _hoisted_3$9),
        withDirectives(createElementVNode("div", _hoisted_4$9, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(columnData.value, (column, index) => {
            return withDirectives((openBlock(), createElementBlock("div", {
              class: "vgrid-visibility-column",
              key: column.field
            }, [
              withDirectives(createElementVNode("input", {
                type: "checkbox",
                id: "grid-column-" + column.field,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => tempValue.value = $event),
                value: column.field
              }, null, 8, _hoisted_5$9), [
                [vModelCheckbox, tempValue.value]
              ]),
              createElementVNode("label", {
                for: "grid-column-" + column.field
              }, toDisplayString(unref(useGridHeader)(column.label || column.field)), 9, _hoisted_6$9),
              createElementVNode("button", {
                class: "vgrid-visibility-down",
                onClick: ($event) => moveDown(index)
              }, "\xA0", 8, _hoisted_7$9),
              createElementVNode("button", {
                class: "vgrid-visibility-up",
                onClick: ($event) => moveUp(index)
              }, "\xA0", 8, _hoisted_8$9)
            ])), [
              [vShow, column.type !== "hidden"]
            ]);
          }), 128))
        ], 512), [
          [vShow, showVisibility.value]
        ])
      ], 8, _hoisted_1$c);
    };
  }
});
const _hoisted_1$b = ["onSubmit"];
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  name: "Search",
  props: {
    modelValue: { default: "" },
    placeholder: { default: "Search" }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const localValue = useLocalValue(props, emits);
    const stop = () => ({});
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("form", {
        class: "vgrid-search",
        onSubmit: withModifiers(stop, ["prevent"])
      }, [
        createVNode(_sfc_main$n, {
          placeholder: __props.placeholder,
          modelValue: unref(localValue),
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(localValue) ? localValue.value = $event : null)
        }, null, 8, ["placeholder", "modelValue"])
      ], 40, _hoisted_1$b);
    };
  }
});
const _hoisted_1$a = { class: "vgrid-status" };
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  name: "Status",
  props: {
    limit: { default: 10 },
    currentPage: { default: 0 },
    total: { default: 0 },
    showed: { default: 10 }
  },
  setup(__props) {
    const props = __props;
    const paginationInfo = computed(() => {
      const from = props.limit * props.currentPage;
      const to = from + props.showed;
      return `Showing ${from + 1} to ${to} of ${props.total} entries`;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$a, toDisplayString(unref(paginationInfo)), 1);
    };
  }
});
const _hoisted_1$9 = { class: "vgrid-export-button" };
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  name: "ExportButton",
  props: {
    data: { default: () => [] },
    columns: { default: () => [] },
    fileName: { default: new Date().toISOString() }
  },
  setup(__props) {
    const props = __props;
    const filteredColumn = computed(() => {
      return props.columns.filter((c) => c.type !== "custom");
    });
    const exportData = () => {
      const header = filteredColumn.value.map((c) => c.label).join(",");
      const body = props.data.map((d) => {
        return filteredColumn.value.map((c) => getData(c.field, d)).map((v) => `"${v}"`).join(",");
      }).join("\n");
      const csvContent = `data:text/csv;charset=utf-8,${header}
${body}`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${props.fileName}.csv`);
      document.body.appendChild(link);
      link.click();
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$9, [
        createElementVNode("button", { onClick: exportData }, "Export")
      ]);
    };
  }
});
const _hoisted_1$8 = { class: "vgrid-header" };
const _hoisted_2$8 = { class: "vgrid-body" };
const _hoisted_3$8 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4$8 = { key: 0 };
const _hoisted_5$8 = { key: 1 };
const _hoisted_6$8 = { class: "vgrid-responsive" };
const _hoisted_7$8 = { class: "vgrid-table" };
const _hoisted_8$8 = ["onClick"];
const _hoisted_9$8 = { class: "vgrid-field-header-content" };
const _hoisted_10$8 = {
  key: 0,
  class: "vgrid-table-filter"
};
const _hoisted_11$8 = { key: 1 };
const _hoisted_12$8 = ["colspan"];
const _hoisted_13$8 = { key: 0 };
const _hoisted_14$8 = { key: 1 };
const _hoisted_15$5 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_16$2 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_17$2 = [
  _hoisted_16$2
];
const _hoisted_18$2 = { class: "vgrid-footer" };
const _hoisted_19$2 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_20$2 = { class: "vgrid-col-9" };
const _hoisted_21$2 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_22$2 = { key: 0 };
const _sfc_main$8 = defineComponent({
  name: "BasicGrid",
  props: {
    data: { default: () => [] },
    searchField: { default: "s" },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean, default: false }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider,
      setDataCollections
    } = useJsonData(props, { displayType: "grid", dataType: "json" }, () => {
      getData2();
    });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1$8, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).searchKeyword,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).searchKeyword = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2$8, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3$8, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4$8, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5$8, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            createElementVNode("div", _hoisted_6$8, [
              createElementVNode("table", _hoisted_7$8, [
                renderSlot(_ctx.$slots, "table-head", { cols: unref(visibleCols) }, () => [
                  createElementVNode("thead", null, [
                    createElementVNode("tr", null, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createElementBlock("th", {
                          class: normalizeClass(["vgrid-field-header", col.headerClasses]),
                          onClick: ($event) => unref(setOrder)(col.field),
                          key: col.id
                        }, [
                          createElementVNode("div", _hoisted_9$8, [
                            renderSlot(_ctx.$slots, "column-header-" + col.field, { col }, () => [
                              createElementVNode("span", null, toDisplayString(col.showedLabel), 1),
                              createElementVNode("b", {
                                class: normalizeClass(col.orderClasses)
                              }, null, 2)
                            ])
                          ])
                        ], 10, _hoisted_8$8);
                      }), 128))
                    ])
                  ])
                ]),
                renderSlot(_ctx.$slots, "table-body", {
                  entries: unref(dataState).records
                }, () => [
                  createElementVNode("tbody", null, [
                    __props.columnFilterable && unref(hasColumnFilter) ? (openBlock(), createElementBlock("tr", _hoisted_10$8, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createElementBlock("td", {
                          key: col.field
                        }, [
                          col.filter ? (openBlock(), createBlock(_sfc_main$k, {
                            key: 0,
                            column: col,
                            modelValue: unref(gridState).where[col.field],
                            "onUpdate:modelValue": ($event) => unref(gridState).where[col.field] = $event
                          }, null, 8, ["column", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true)
                        ]);
                      }), 128))
                    ])) : createCommentVNode("", true),
                    !unref(hasRecord) ? (openBlock(), createElementBlock("tr", _hoisted_11$8, [
                      createElementVNode("td", {
                        colspan: unref(visibleCols).length
                      }, [
                        !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_13$8, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_14$8, toDisplayString(__props.strEmptyFilteredData), 1))
                      ], 8, _hoisted_12$8)
                    ])) : (openBlock(true), createElementBlock(Fragment, { key: 2 }, renderList(unref(dataState).records, (entry, entryIndex) => {
                      return openBlock(), createElementBlock("tr", null, [
                        renderSlot(_ctx.$slots, "default", {
                          entry,
                          index: entryIndex,
                          visibleCols: unref(visibleCols)
                        }, () => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                            return openBlock(), createElementBlock("td", {
                              key: col.field
                            }, [
                              createVNode(_sfc_main$o, {
                                column: col,
                                data: entry,
                                class: normalizeClass(col.columnClasses)
                              }, {
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, "column-" + col.field, {
                                    entry,
                                    index: entryIndex
                                  })
                                ]),
                                _: 2
                              }, 1032, ["column", "data", "class"])
                            ]);
                          }), 128))
                        ])
                      ]);
                    }), 256))
                  ])
                ])
              ])
            ])
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_15$5, _hoisted_17$2)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_18$2, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_19$2, [
            createElementVNode("div", _hoisted_20$2, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_21$2, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_22$2, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const _hoisted_1$7 = { class: "vgrid-header" };
const _hoisted_2$7 = { class: "vgrid-body" };
const _hoisted_3$7 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4$7 = { key: 0 };
const _hoisted_5$7 = { key: 1 };
const _hoisted_6$7 = { class: "vgrid-row" };
const _hoisted_7$7 = { class: "vgrid-entry-wrapper" };
const _hoisted_8$7 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_9$7 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_10$7 = [
  _hoisted_9$7
];
const _hoisted_11$7 = { class: "vgrid-footer" };
const _hoisted_12$7 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_13$7 = { class: "vgrid-col-9" };
const _hoisted_14$7 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_15$4 = { key: 0 };
const _sfc_main$7 = defineComponent({
  name: "BasicCards",
  props: {
    data: { default: () => [] },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider,
      setDataCollections
    } = useJsonData(props, { displayType: "cards", dataType: "json" }, () => {
      getData2();
    });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1$7, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).searchKeyword,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).searchKeyword = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2$7, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3$7, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4$7, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5$7, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            createElementVNode("div", _hoisted_6$7, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(dataState).records, (entry, entryIndex) => {
                return openBlock(), createElementBlock("div", {
                  class: normalizeClass(["vgrid-col", unref(cardColumnClasses)])
                }, [
                  renderSlot(_ctx.$slots, "default", {
                    entry,
                    index: entryIndex,
                    visibleCols: unref(visibleCols)
                  }, () => [
                    createElementVNode("div", _hoisted_7$7, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createBlock(_sfc_main$o, {
                          column: col,
                          data: entry,
                          key: col.id,
                          resize: true,
                          class: normalizeClass(col.columnClasses)
                        }, {
                          default: withCtx(() => [
                            renderSlot(_ctx.$slots, "column-" + col.field, {
                              entry,
                              index: entryIndex
                            })
                          ]),
                          _: 2
                        }, 1032, ["column", "data", "class"]);
                      }), 128))
                    ])
                  ])
                ], 2);
              }), 256))
            ])
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_8$7, _hoisted_10$7)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_11$7, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_12$7, [
            createElementVNode("div", _hoisted_13$7, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_14$7, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_15$4, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const _hoisted_1$6 = { class: "vgrid-header" };
const _hoisted_2$6 = { class: "vgrid-body" };
const _hoisted_3$6 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4$6 = { key: 0 };
const _hoisted_5$6 = { key: 1 };
const _hoisted_6$6 = { class: "vgrid-entry-wrapper" };
const _hoisted_7$6 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_8$6 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_9$6 = [
  _hoisted_8$6
];
const _hoisted_10$6 = { class: "vgrid-footer" };
const _hoisted_11$6 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_12$6 = { class: "vgrid-col-9" };
const _hoisted_13$6 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_14$6 = { key: 0 };
const _sfc_main$6 = defineComponent({
  name: "BasicList",
  props: {
    data: { default: () => [] },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider,
      setDataCollections
    } = useJsonData(props, { displayType: "list", dataType: "json" }, () => {
      getData2();
    });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1$6, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).searchKeyword,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).searchKeyword = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2$6, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3$6, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4$6, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5$6, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(dataState).records, (entry, entryIndex) => {
              return openBlock(), createElementBlock("div", _hoisted_6$6, [
                renderSlot(_ctx.$slots, "default", {
                  entry,
                  index: entryIndex,
                  visibleCols: unref(visibleCols)
                }, () => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                    return openBlock(), createBlock(_sfc_main$o, {
                      column: col,
                      data: entry,
                      key: col.id,
                      resize: true,
                      class: normalizeClass(col.columnClasses)
                    }, {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "column-" + col.field, {
                          entry,
                          index: entryIndex
                        })
                      ]),
                      _: 2
                    }, 1032, ["column", "data", "class"]);
                  }), 128))
                ])
              ]);
            }), 256))
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_7$6, _hoisted_9$6)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_10$6, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_11$6, [
            createElementVNode("div", _hoisted_12$6, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_13$6, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_14$6, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
function useAjaxData(props, option) {
  const vGridOptions = inject("$vgrid", {
    cursorKey: "cursor",
    pageKey: "page",
    hasSortType: true,
    sortKey: "sort",
    sortTypeKey: "sort_type",
    perPageKey: "limit",
    fetchData: null,
    cancelToken: null,
    getPageIndex: null,
    extractData: null
  });
  const baseOptions = useOption(props);
  const ajaxOptions = computed(() => ({
    resource: props.resource,
    searchField: props.searchField,
    pageKey: props.cursorPagination ? vGridOptions.cursorKey : vGridOptions.pageKey,
    cursorPagination: props.cursorPagination,
    perPageKey: vGridOptions.perPageKey,
    sortKey: vGridOptions.sortKey,
    sortTypeKey: vGridOptions.sortTypeKey,
    getPageIndex: vGridOptions.getPageIndex,
    extractData: vGridOptions.extractData,
    fetchData: vGridOptions.fetchData,
    cancelToken: vGridOptions.cancelToken
  }));
  const gridOption = computed(() => __spreadValues(__spreadValues(__spreadValues({}, baseOptions.value), ajaxOptions.value), option));
  const dataProvider = new AjaxDataProvider(props.resource, gridOption.value);
  return {
    dataProvider,
    gridOption
  };
}
const _hoisted_1$5 = { class: "vgrid-header" };
const _hoisted_2$5 = { class: "vgrid-body" };
const _hoisted_3$5 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4$5 = { key: 0 };
const _hoisted_5$5 = { key: 1 };
const _hoisted_6$5 = { class: "vgrid-responsive" };
const _hoisted_7$5 = { class: "vgrid-table" };
const _hoisted_8$5 = ["onClick"];
const _hoisted_9$5 = { class: "vgrid-field-header-content" };
const _hoisted_10$5 = {
  key: 0,
  class: "vgrid-table-filter"
};
const _hoisted_11$5 = { key: 1 };
const _hoisted_12$5 = ["colspan"];
const _hoisted_13$5 = { key: 0 };
const _hoisted_14$5 = { key: 1 };
const _hoisted_15$3 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_16$1 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_17$1 = [
  _hoisted_16$1
];
const _hoisted_18$1 = { class: "vgrid-footer" };
const _hoisted_19$1 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_20$1 = { class: "vgrid-col-9" };
const _hoisted_21$1 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_22$1 = { key: 0 };
const _sfc_main$5 = defineComponent({
  name: "AjaxGrid",
  props: {
    resource: { default: "" },
    searchField: { default: "" },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider
    } = useAjaxData(props, { displayType: "grid", dataType: "ajax" });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1$5, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).searchKeyword,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).searchKeyword = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2$5, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3$5, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4$5, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5$5, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            createElementVNode("div", _hoisted_6$5, [
              createElementVNode("table", _hoisted_7$5, [
                renderSlot(_ctx.$slots, "table-head", { cols: unref(visibleCols) }, () => [
                  createElementVNode("thead", null, [
                    createElementVNode("tr", null, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createElementBlock("th", {
                          class: normalizeClass(["vgrid-field-header", col.headerClasses]),
                          onClick: ($event) => unref(setOrder)(col.field),
                          key: col.id
                        }, [
                          createElementVNode("div", _hoisted_9$5, [
                            renderSlot(_ctx.$slots, "column-header-" + col.field, { col }, () => [
                              createElementVNode("span", null, toDisplayString(col.showedLabel), 1),
                              createElementVNode("b", {
                                class: normalizeClass(col.orderClasses)
                              }, null, 2)
                            ])
                          ])
                        ], 10, _hoisted_8$5);
                      }), 128))
                    ])
                  ])
                ]),
                renderSlot(_ctx.$slots, "table-body", {
                  entries: unref(dataState).records
                }, () => [
                  createElementVNode("tbody", null, [
                    __props.columnFilterable && unref(hasColumnFilter) ? (openBlock(), createElementBlock("tr", _hoisted_10$5, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createElementBlock("td", {
                          key: col.field
                        }, [
                          col.filter ? (openBlock(), createBlock(_sfc_main$k, {
                            key: 0,
                            column: col,
                            modelValue: unref(gridState).where[col.field],
                            "onUpdate:modelValue": ($event) => unref(gridState).where[col.field] = $event
                          }, null, 8, ["column", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true)
                        ]);
                      }), 128))
                    ])) : createCommentVNode("", true),
                    !unref(hasRecord) ? (openBlock(), createElementBlock("tr", _hoisted_11$5, [
                      createElementVNode("td", {
                        colspan: unref(visibleCols).length
                      }, [
                        !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_13$5, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_14$5, toDisplayString(__props.strEmptyFilteredData), 1))
                      ], 8, _hoisted_12$5)
                    ])) : (openBlock(true), createElementBlock(Fragment, { key: 2 }, renderList(unref(dataState).records, (entry, entryIndex) => {
                      return openBlock(), createElementBlock("tr", null, [
                        renderSlot(_ctx.$slots, "default", {
                          entry,
                          index: entryIndex,
                          visibleCols: unref(visibleCols)
                        }, () => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                            return openBlock(), createElementBlock("td", {
                              key: col.field
                            }, [
                              createVNode(_sfc_main$o, {
                                column: col,
                                data: entry,
                                class: normalizeClass(col.columnClasses)
                              }, {
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, "column-" + col.field, {
                                    entry,
                                    index: entryIndex
                                  })
                                ]),
                                _: 2
                              }, 1032, ["column", "data", "class"])
                            ]);
                          }), 128))
                        ])
                      ]);
                    }), 256))
                  ])
                ])
              ])
            ])
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_15$3, _hoisted_17$1)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_18$1, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_19$1, [
            createElementVNode("div", _hoisted_20$1, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_21$1, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_22$1, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const _hoisted_1$4 = { class: "vgrid-header" };
const _hoisted_2$4 = { class: "vgrid-body" };
const _hoisted_3$4 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4$4 = { key: 0 };
const _hoisted_5$4 = { key: 1 };
const _hoisted_6$4 = { class: "vgrid-entry-wrapper" };
const _hoisted_7$4 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_8$4 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_9$4 = [
  _hoisted_8$4
];
const _hoisted_10$4 = { class: "vgrid-footer" };
const _hoisted_11$4 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_12$4 = { class: "vgrid-col-9" };
const _hoisted_13$4 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_14$4 = { key: 0 };
const _sfc_main$4 = defineComponent({
  name: "AjaxList",
  props: {
    resource: { default: "" },
    searchField: { default: "" },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider
    } = useAjaxData(props, { displayType: "list", dataType: "ajax" });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1$4, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).searchKeyword,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).searchKeyword = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2$4, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3$4, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4$4, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5$4, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(dataState).records, (entry, entryIndex) => {
              return openBlock(), createElementBlock("div", _hoisted_6$4, [
                renderSlot(_ctx.$slots, "default", {
                  entry,
                  index: entryIndex,
                  visibleCols: unref(visibleCols)
                }, () => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                    return openBlock(), createBlock(_sfc_main$o, {
                      column: col,
                      data: entry,
                      key: col.id,
                      resize: true,
                      class: normalizeClass(col.columnClasses)
                    }, {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "column-" + col.field, {
                          entry,
                          index: entryIndex
                        })
                      ]),
                      _: 2
                    }, 1032, ["column", "data", "class"]);
                  }), 128))
                ])
              ]);
            }), 256))
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_7$4, _hoisted_9$4)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_10$4, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_11$4, [
            createElementVNode("div", _hoisted_12$4, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_13$4, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_14$4, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const _hoisted_1$3 = { class: "vgrid-header" };
const _hoisted_2$3 = { class: "vgrid-body" };
const _hoisted_3$3 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4$3 = { key: 0 };
const _hoisted_5$3 = { key: 1 };
const _hoisted_6$3 = { class: "vgrid-row" };
const _hoisted_7$3 = { class: "vgrid-entry-wrapper" };
const _hoisted_8$3 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_9$3 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_10$3 = [
  _hoisted_9$3
];
const _hoisted_11$3 = { class: "vgrid-footer" };
const _hoisted_12$3 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_13$3 = { class: "vgrid-col-9" };
const _hoisted_14$3 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_15$2 = { key: 0 };
const _sfc_main$3 = defineComponent({
  name: "AjaxCards",
  props: {
    resource: { default: "" },
    searchField: { default: "" },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider
    } = useAjaxData(props, { displayType: "cards", dataType: "ajax" });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1$3, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).searchKeyword,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).searchKeyword = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2$3, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3$3, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4$3, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5$3, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            createElementVNode("div", _hoisted_6$3, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(dataState).records, (entry, entryIndex) => {
                return openBlock(), createElementBlock("div", {
                  class: normalizeClass(["vgrid-col", unref(cardColumnClasses)])
                }, [
                  renderSlot(_ctx.$slots, "default", {
                    entry,
                    index: entryIndex,
                    visibleCols: unref(visibleCols)
                  }, () => [
                    createElementVNode("div", _hoisted_7$3, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createBlock(_sfc_main$o, {
                          column: col,
                          data: entry,
                          key: col.id,
                          resize: true,
                          class: normalizeClass(col.columnClasses)
                        }, {
                          default: withCtx(() => [
                            renderSlot(_ctx.$slots, "column-" + col.field, {
                              entry,
                              index: entryIndex
                            })
                          ]),
                          _: 2
                        }, 1032, ["column", "data", "class"]);
                      }), 128))
                    ])
                  ])
                ], 2);
              }), 256))
            ])
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_8$3, _hoisted_10$3)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_11$3, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_12$3, [
            createElementVNode("div", _hoisted_13$3, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_14$3, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_15$2, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
function useGraphData(props, option) {
  const vGridOptions = inject("$vgrid", {
    filterKey: "where",
    limitKey: "limit",
    offsetKey: "offset",
    aggregateQuery: "aggregate { count }",
    graphqlFilter: null,
    graphqlOrder: null,
    graphqlDataCounter: null
  });
  const apolloClient = inject("$vgridApolloClient", null);
  if (!apolloClient) {
    throw new Error("$vgridApolloClient is not defined");
  }
  const baseOptions = useOption(props);
  const graphOptions = computed(() => ({
    resource: props.resource,
    resourceMeta: props.resourceMeta,
    searchField: props.searchField,
    refFilter: props.refFilter,
    offsetKey: vGridOptions.offsetKey,
    limitKey: vGridOptions.limitKey,
    filterKey: vGridOptions.filterKey,
    aggregateQuery: vGridOptions.aggregateQuery,
    graphqlFilter: vGridOptions.graphqlFilter,
    graphqlOrder: vGridOptions.graphqlOrder,
    graphqlDataCounter: vGridOptions.graphqlDataCounter
  }));
  const gridOption = computed(() => __spreadValues(__spreadValues(__spreadValues({}, baseOptions.value), graphOptions.value), option));
  const dataProvider = new GraphDataProvider(apolloClient, props.resource, gridOption.value);
  return {
    dataProvider,
    gridOption
  };
}
const _hoisted_1$2 = { class: "vgrid-header" };
const _hoisted_2$2 = { class: "vgrid-body" };
const _hoisted_3$2 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4$2 = { key: 0 };
const _hoisted_5$2 = { key: 1 };
const _hoisted_6$2 = { class: "vgrid-responsive" };
const _hoisted_7$2 = { class: "vgrid-table" };
const _hoisted_8$2 = ["onClick"];
const _hoisted_9$2 = { class: "vgrid-field-header-content" };
const _hoisted_10$2 = {
  key: 0,
  class: "vgrid-table-filter"
};
const _hoisted_11$2 = { key: 1 };
const _hoisted_12$2 = ["colspan"];
const _hoisted_13$2 = { key: 0 };
const _hoisted_14$2 = { key: 1 };
const _hoisted_15$1 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_16 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_17 = [
  _hoisted_16
];
const _hoisted_18 = { class: "vgrid-footer" };
const _hoisted_19 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_20 = { class: "vgrid-col-9" };
const _hoisted_21 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_22 = { key: 0 };
const _sfc_main$2 = defineComponent({
  name: "GraphGrid",
  props: {
    resource: null,
    resourceMeta: null,
    searchField: null,
    refFilter: { default: "" },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider
    } = useGraphData(props, { displayType: "grid", dataType: "graph" });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption, ["refFilter"]);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1$2, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).where[__props.searchField],
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).where[__props.searchField] = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2$2, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3$2, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4$2, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5$2, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            createElementVNode("div", _hoisted_6$2, [
              createElementVNode("table", _hoisted_7$2, [
                renderSlot(_ctx.$slots, "table-head", { cols: unref(visibleCols) }, () => [
                  createElementVNode("thead", null, [
                    createElementVNode("tr", null, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createElementBlock("th", {
                          class: normalizeClass(["vgrid-field-header", col.headerClasses]),
                          onClick: ($event) => unref(setOrder)(col.field),
                          key: col.id
                        }, [
                          createElementVNode("div", _hoisted_9$2, [
                            renderSlot(_ctx.$slots, "column-header-" + col.field, { col }, () => [
                              createElementVNode("span", null, toDisplayString(col.showedLabel), 1),
                              createElementVNode("b", {
                                class: normalizeClass(col.orderClasses)
                              }, null, 2)
                            ])
                          ])
                        ], 10, _hoisted_8$2);
                      }), 128))
                    ])
                  ])
                ]),
                renderSlot(_ctx.$slots, "table-body", {
                  entries: unref(dataState).records
                }, () => [
                  createElementVNode("tbody", null, [
                    __props.columnFilterable && unref(hasColumnFilter) ? (openBlock(), createElementBlock("tr", _hoisted_10$2, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createElementBlock("td", {
                          key: col.field
                        }, [
                          col.filter ? (openBlock(), createBlock(_sfc_main$k, {
                            key: 0,
                            column: col,
                            modelValue: unref(gridState).where[col.field],
                            "onUpdate:modelValue": ($event) => unref(gridState).where[col.field] = $event
                          }, null, 8, ["column", "modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true)
                        ]);
                      }), 128))
                    ])) : createCommentVNode("", true),
                    !unref(hasRecord) ? (openBlock(), createElementBlock("tr", _hoisted_11$2, [
                      createElementVNode("td", {
                        colspan: unref(visibleCols).length
                      }, [
                        !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_13$2, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_14$2, toDisplayString(__props.strEmptyFilteredData), 1))
                      ], 8, _hoisted_12$2)
                    ])) : (openBlock(true), createElementBlock(Fragment, { key: 2 }, renderList(unref(dataState).records, (entry, entryIndex) => {
                      return openBlock(), createElementBlock("tr", null, [
                        renderSlot(_ctx.$slots, "default", {
                          entry,
                          index: entryIndex,
                          visibleCols: unref(visibleCols)
                        }, () => [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                            return openBlock(), createElementBlock("td", {
                              key: col.field
                            }, [
                              createVNode(_sfc_main$o, {
                                column: col,
                                data: entry,
                                class: normalizeClass(col.columnClasses)
                              }, {
                                default: withCtx(() => [
                                  renderSlot(_ctx.$slots, "column-" + col.field, {
                                    entry,
                                    index: entryIndex
                                  })
                                ]),
                                _: 2
                              }, 1032, ["column", "data", "class"])
                            ]);
                          }), 128))
                        ])
                      ]);
                    }), 256))
                  ])
                ])
              ])
            ])
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_15$1, _hoisted_17)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_18, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_19, [
            createElementVNode("div", _hoisted_20, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_21, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_22, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const _hoisted_1$1 = { class: "vgrid-header" };
const _hoisted_2$1 = { class: "vgrid-body" };
const _hoisted_3$1 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4$1 = { key: 0 };
const _hoisted_5$1 = { key: 1 };
const _hoisted_6$1 = { class: "vgrid-entry-wrapper" };
const _hoisted_7$1 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_8$1 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_9$1 = [
  _hoisted_8$1
];
const _hoisted_10$1 = { class: "vgrid-footer" };
const _hoisted_11$1 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_12$1 = { class: "vgrid-col-9" };
const _hoisted_13$1 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_14$1 = { key: 0 };
const _sfc_main$1 = defineComponent({
  name: "GraphList",
  props: {
    resource: null,
    resourceMeta: null,
    searchField: null,
    refFilter: { default: "" },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider
    } = useGraphData(props, { displayType: "list", dataType: "graph" });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption, ["refFilter"]);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1$1, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).where[__props.searchField],
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).where[__props.searchField] = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2$1, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3$1, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4$1, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5$1, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(dataState).records, (entry, entryIndex) => {
              return openBlock(), createElementBlock("div", _hoisted_6$1, [
                renderSlot(_ctx.$slots, "default", {
                  entry,
                  index: entryIndex,
                  visibleCols: unref(visibleCols)
                }, () => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                    return openBlock(), createBlock(_sfc_main$o, {
                      column: col,
                      data: entry,
                      key: col.id,
                      resize: true,
                      class: normalizeClass(col.columnClasses)
                    }, {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "column-" + col.field, {
                          entry,
                          index: entryIndex
                        })
                      ]),
                      _: 2
                    }, 1032, ["column", "data", "class"]);
                  }), 128))
                ])
              ]);
            }), 256))
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_7$1, _hoisted_9$1)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_10$1, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_11$1, [
            createElementVNode("div", _hoisted_12$1, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_13$1, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_14$1, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const _hoisted_1 = { class: "vgrid-header" };
const _hoisted_2 = { class: "vgrid-body" };
const _hoisted_3 = {
  key: 0,
  class: "vgrid-nodata"
};
const _hoisted_4 = { key: 0 };
const _hoisted_5 = { key: 1 };
const _hoisted_6 = { class: "vgrid-row" };
const _hoisted_7 = { class: "vgrid-entry-wrapper" };
const _hoisted_8 = {
  key: 2,
  class: "vgrid-loader"
};
const _hoisted_9 = /* @__PURE__ */ createElementVNode("span", { class: "vgrid-sr-only" }, "Loading..", -1);
const _hoisted_10 = [
  _hoisted_9
];
const _hoisted_11 = { class: "vgrid-footer" };
const _hoisted_12 = {
  key: 0,
  class: "vgrid-devbar"
};
const _hoisted_13 = { class: "vgrid-col-9" };
const _hoisted_14 = { class: "vgrid-col-3 vgrid-align-right" };
const _hoisted_15 = { key: 0 };
const _sfc_main = defineComponent({
  name: "GraphCards",
  props: {
    resource: null,
    resourceMeta: null,
    searchField: null,
    refFilter: { default: "" },
    columns: { default: () => [] },
    perPage: null,
    filterable: { type: Boolean, default: true },
    columnFilterable: { type: Boolean, default: false },
    columnVisible: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: null,
    orderable: { type: Boolean, default: false },
    sortBy: null,
    sortType: { default: "desc" },
    statusable: { type: Boolean, default: true },
    pagable: { type: Boolean, default: true },
    pagination: { type: Boolean, default: true },
    strEmptyFilteredData: { default: "No data matched" },
    strEmptyData: { default: "Empty data" },
    exportable: { type: Boolean, default: false },
    exportFileName: null,
    colMd: { default: 6 },
    colLg: { default: 4 },
    colXl: { default: 3 },
    routeState: { type: Boolean, default: false },
    cursorPagination: { type: Boolean }
  },
  emits: ["data-changed"],
  setup(__props, { expose, emit: emits }) {
    const props = __props;
    const {
      gridOption,
      dataProvider
    } = useGraphData(props, { displayType: "cards", dataType: "graph" });
    const {
      hasColumnFilter,
      hasColumnOrder,
      cardColumnClasses,
      dataState,
      hasRecord,
      columnVisibility,
      isEmptyData,
      visibleCols,
      gridClasses,
      setColumnVisibility,
      gridState,
      isFiltered,
      getData: getData2,
      setOrder,
      setFilter,
      resetGrid
    } = useGrid(props, emits, dataProvider, gridOption, ["refFilter"]);
    setColumnVisibility();
    getData2();
    expose({
      getData: getData2,
      setFilter
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["vgrid", unref(gridClasses)])
      }, [
        createElementVNode("div", _hoisted_1, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            renderSlot(_ctx.$slots, "header-start"),
            __props.searchable ? (openBlock(), createBlock(_sfc_main$b, {
              key: 0,
              modelValue: unref(gridState).where[__props.searchField],
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(gridState).where[__props.searchField] = $event),
              placeholder: __props.searchPlaceholder
            }, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
            __props.filterable && unref(hasColumnFilter) ? (openBlock(), createBlock(_sfc_main$f, {
              key: 1,
              modelValue: unref(gridState).where,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(gridState).where = $event),
              columns: __props.columns
            }, null, 8, ["modelValue", "columns"])) : createCommentVNode("", true),
            __props.orderable && unref(hasColumnOrder) ? (openBlock(), createBlock(_sfc_main$e, {
              key: 2,
              class: "vgrid-ml-auto",
              modelValue: unref(gridState).order,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(gridState).order = $event),
              "has-sort-type": unref(gridState).hasSortType,
              columns: __props.columns
            }, null, 8, ["modelValue", "has-sort-type", "columns"])) : createCommentVNode("", true),
            __props.columnVisible ? (openBlock(), createBlock(_sfc_main$c, {
              key: 3,
              class: "vgrid-ml-auto",
              columns: __props.columns,
              modelValue: unref(columnVisibility),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(columnVisibility) ? columnVisibility.value = $event : null)
            }, null, 8, ["columns", "modelValue"])) : createCommentVNode("", true),
            __props.exportable ? (openBlock(), createBlock(_sfc_main$9, {
              key: 4,
              class: "vgrid-ml-auto",
              columns: unref(visibleCols),
              data: unref(dataState).records,
              "file-name": __props.exportFileName ? __props.exportFileName : ""
            }, null, 8, ["columns", "data", "file-name"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "header-end")
          ])
        ]),
        createElementVNode("div", _hoisted_2, [
          !unref(hasRecord) ? (openBlock(), createElementBlock("div", _hoisted_3, [
            !unref(isFiltered) ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(__props.strEmptyData), 1)) : (openBlock(), createElementBlock("span", _hoisted_5, toDisplayString(__props.strEmptyFilteredData), 1))
          ])) : createCommentVNode("", true),
          !unref(isEmptyData) ? renderSlot(_ctx.$slots, "body", {
            key: 1,
            entries: unref(dataState).records,
            visibleCols: unref(visibleCols)
          }, () => [
            createElementVNode("div", _hoisted_6, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(dataState).records, (entry, entryIndex) => {
                return openBlock(), createElementBlock("div", {
                  class: normalizeClass(["vgrid-col", unref(cardColumnClasses)])
                }, [
                  renderSlot(_ctx.$slots, "default", {
                    entry,
                    index: entryIndex,
                    visibleCols: unref(visibleCols)
                  }, () => [
                    createElementVNode("div", _hoisted_7, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(visibleCols), (col) => {
                        return openBlock(), createBlock(_sfc_main$o, {
                          column: col,
                          data: entry,
                          key: col.id,
                          resize: true,
                          class: normalizeClass(col.columnClasses)
                        }, {
                          default: withCtx(() => [
                            renderSlot(_ctx.$slots, "column-" + col.field, {
                              entry,
                              index: entryIndex
                            })
                          ]),
                          _: 2
                        }, 1032, ["column", "data", "class"]);
                      }), 128))
                    ])
                  ])
                ], 2);
              }), 256))
            ])
          ]) : createCommentVNode("", true),
          unref(gridState).isLoading ? (openBlock(), createElementBlock("div", _hoisted_8, _hoisted_10)) : createCommentVNode("", true)
        ]),
        createElementVNode("div", _hoisted_11, [
          renderSlot(_ctx.$slots, "footer", {}, () => [
            renderSlot(_ctx.$slots, "footer-start"),
            __props.pagable ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              modelValue: unref(gridState).limit,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(gridState).limit = $event),
              sizes: unref(gridState).pageSizes
            }, null, 8, ["modelValue", "sizes"])) : createCommentVNode("", true),
            !__props.cursorPagination ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              __props.statusable ? (openBlock(), createBlock(_sfc_main$a, {
                key: 0,
                limit: unref(gridState).limit,
                "current-page": unref(gridState).currentPage,
                showed: unref(dataState).records.length,
                total: unref(dataState).total
              }, null, 8, ["limit", "current-page", "showed", "total"])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            __props.pagination ? renderSlot(_ctx.$slots, "pagination", { key: 2 }, () => [
              __props.cursorPagination ? (openBlock(), createBlock(_sfc_main$t, {
                key: 0,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(gridState).currentPage = $event),
                meta: unref(dataState).meta
              }, null, 8, ["modelValue", "meta"])) : (openBlock(), createBlock(_sfc_main$u, {
                key: 1,
                modelValue: unref(gridState).currentPage,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(gridState).currentPage = $event),
                limit: unref(gridState).limit,
                total: unref(dataState).total
              }, null, 8, ["modelValue", "limit", "total"]))
            ]) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "footer-end")
          ]),
          unref(gridOption).debug ? (openBlock(), createElementBlock("div", _hoisted_12, [
            createElementVNode("div", _hoisted_13, [
              createElementVNode("pre", null, toDisplayString(unref(gridState).query), 1)
            ]),
            createElementVNode("div", _hoisted_14, [
              unref(gridState).isLoading ? (openBlock(), createElementBlock("span", _hoisted_15, "Loading..")) : createCommentVNode("", true)
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
var _index = "";
const VueGridPlugin = {
  install(Vue, options = {}) {
    Vue.component("VGrid", _sfc_main$8);
    Vue.component("VList", _sfc_main$6);
    Vue.component("VCards", _sfc_main$7);
    const gridOption = {
      debug: options.debug,
      perPage: options.perPage || 10,
      pageSizes: options.pageSizes || [5, 10, 20, 50, 100],
      routerKey: options.routerKey
    };
    let graphqlOption = {};
    let ajaxOption = {};
    if (options.graphql) {
      Vue.component("VGraphGrid", _sfc_main$2);
      Vue.component("VGraphList", _sfc_main$1);
      Vue.component("VGraphCards", _sfc_main);
      graphqlOption = {
        filterKey: options.filterKey || "where",
        limitKey: options.limitKey || "limit",
        offsetKey: options.offsetKey || "offset",
        aggregateQuery: options.aggregateQuery || "aggregate { count }",
        graphqlFilter: options.graphqlFilter,
        graphqlOrder: options.graphqlOrder,
        graphqlDataCounter: options.graphqlDataCounter
      };
    }
    if (options.ajax) {
      Vue.component("VAjaxGrid", _sfc_main$5);
      Vue.component("VAjaxList", _sfc_main$4);
      Vue.component("VAjaxCards", _sfc_main$3);
      ajaxOption = {
        pageKey: options.pageKey || "page",
        cursorKey: options.cursorKey || "cursor",
        hasSortType: options.hasSortType || true,
        sortKey: options.sortKey || "sort",
        sortTypeKey: options.sortTypeKey || "sort_type",
        perPageKey: options.perPageKey || "limit",
        fetchData: options.fetchData,
        cancelToken: options.cancelToken,
        extractData: options.extractData,
        getPageIndex: options.getPageIndex
      };
    }
    const vueGridOptions = __spreadValues(__spreadValues(__spreadValues({}, gridOption), ajaxOption), graphqlOption);
    Vue.provide("$vgrid", vueGridOptions);
  }
};
export { _sfc_main$u as Pagination, _sfc_main$3 as VAjaxCards, _sfc_main$5 as VAjaxGrid, _sfc_main$4 as VAjaxList, _sfc_main$7 as VCards, _sfc_main as VGraphCards, _sfc_main$2 as VGraphGrid, _sfc_main$1 as VGraphList, _sfc_main$8 as VGrid, _sfc_main$6 as VList, VueGridPlugin as default };
