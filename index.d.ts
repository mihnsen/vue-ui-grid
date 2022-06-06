// @see: https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
// Type definitions for vue-ui-grid
// Project: Additional UI elements for VueJS
// Definitions by: mihnsen <https://github.com/mihnsen/>

/*~ This is the module template file. You should rename it to index.d.ts
 *~ and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ If this module is a UMD module that exposes a global variable 'myLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
import Vue, { PluginObject, PluginFunction } from 'vue'

export default class VueGridPlugin implements PluginObject<any>{
  [key: string]: any
  install: PluginFunction<any>

  static install(pVue: typeof Vue, options?:any): void
}

/*~ If this module has methods, declare them as functions like so.
 */
export function gridMethod(a: string): string;

// Grid and List
export const VGrid: object;
export const VList: object;
export const VCards: object;

// Ajax
export const VAjaxGrid: object;
export const VAjaxList: object;
export const VAjaxCards: object;

// Graph
export const VGraphGrid: object;
export const VGraphList: object;
export const VGraphCards: object;

export const VPagination: object;

