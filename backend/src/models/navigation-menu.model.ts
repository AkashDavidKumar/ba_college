/**
 * navigation-menu.model.ts — Navigation Menu Builder Mongoose Model
 *
 * Implements:
 *  1. Persistent storage for hierarchical navigation menus (main menus, submenus, nested links).
 *  2. Target attributes (_self, _blank), custom flags, order, and icon indicators.
 *  3. References to DynamicPage records for custom dynamic routing.
 *  4. Scoping fields (departmentId, clubId) for granular RBAC boundaries.
 *  5. Timestamps and actor attribution for auditability.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export const MENU_TARGETS = ['_self', '_blank'] as const;
export type MenuTarget = (typeof MENU_TARGETS)[number];

export interface INavigationMenu {
  label: string;
  path: string;
  icon?: string;
  order: number;
  parentId?: string | null;
  target: MenuTarget;
  isCustom: boolean;
  visible: boolean;
  pageId?: string;
  departmentId?: string;
  clubId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INavigationMenuDocument extends INavigationMenu, Document {}

export type INavigationMenuModel = Model<INavigationMenuDocument>;

const navigationMenuSchema = new Schema<INavigationMenuDocument, INavigationMenuModel>(
  {
    label: {
      type: String,
      required: [true, 'Menu label is required'],
      trim: true,
      maxlength: [100, 'Menu label cannot exceed 100 characters'],
    },
    path: {
      type: String,
      required: [true, 'Destination path or URL is required'],
      trim: true,
      maxlength: [500, 'Path cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, 'Icon name cannot exceed 50 characters'],
      default: '',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    parentId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    target: {
      type: String,
      enum: MENU_TARGETS,
      default: '_self',
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
    visible: {
      type: Boolean,
      default: true,
      index: true,
    },
    pageId: {
      type: String,
      trim: true,
      index: true,
    },
    departmentId: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    clubId: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'navigation_menus',
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'] ? String(ret['_id']) : undefined;
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

navigationMenuSchema.index({ parentId: 1, order: 1 });
navigationMenuSchema.index({ visible: 1, order: 1 });
navigationMenuSchema.index({ departmentId: 1, visible: 1 });
navigationMenuSchema.index({ clubId: 1, visible: 1 });

export const NavigationMenu: INavigationMenuModel =
  (mongoose.models.NavigationMenu as INavigationMenuModel) ||
  mongoose.model<INavigationMenuDocument, INavigationMenuModel>(
    'NavigationMenu',
    navigationMenuSchema,
    'navigation_menus'
  );
