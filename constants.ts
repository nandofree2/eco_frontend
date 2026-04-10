import { 
  LayoutDashboard, Package, Tags, Scale, Users, UserCircle, Shield, LucideIcon, MapPin, Map, Building2, Boxes, SlidersHorizontal 
} from 'lucide-react';
import { Subject } from './services/ability';

export interface NavItem {
  label: string;
  path?: string;
  icon: LucideIcon;
  menuId: string;
  colorClass: string;
  resource?: Subject;
  description?: string;
  children?: {
    label: string;
    path: string;
    icon: LucideIcon;
    resource: Subject;
    description?: string;
  }[];
}

export const NAV_STRUCTURE: NavItem[] = [
  { 
      label: 'Dashboard', 
      path: '/', 
      icon: LayoutDashboard, 
      menuId: 'dashboard',
      colorClass: 'bg-red-500',
      resource: 'Dashboard',
      description: 'System overview and statistics'
  },
  { 
      label: 'Inventory', 
      icon: Package, 
      menuId: 'product_menu',
      colorClass: 'bg-blue-500',
      description: 'Manage products, categories and units',
      children: [
          { label: 'Products', path: '/products', icon: Package, resource: 'Product', description: 'Manage your product catalog' },
          { label: 'Stock', path: '/stock_products', icon: Boxes, resource: 'StockProduct', description: 'Manage product stock levels' },
          { label: 'Adjustments', path: '/adjustment_products', icon: SlidersHorizontal, resource: 'AdjustmentProduct', description: 'Manage stock adjustments' },
          { label: 'Categories', path: '/categories', icon: Tags, resource: 'Category', description: 'Organize products by category' },
          { label: 'Units', path: '/units', icon: Scale, resource: 'UnitOfMeasurement', description: 'Manage measurement units' },
      ]
  },
  { 
      label: 'Zone', 
      icon: Map, 
      menuId: 'zone_menu',
      colorClass: 'bg-emerald-500',
      description: 'Geographical regions and zones',
      children: [
          { label: 'Provinces', path: '/provinces', icon: MapPin, resource: 'Province', description: 'Manage provinces and regions' },
          { label: 'Cities', path: '/cities', icon: MapPin, resource: 'City', description: 'Manage cities and municipalities' },
          { label: 'Branches', path: '/branches', icon: Building2, resource: 'Branch', description: 'Manage business branches' }
      ]
  },
  { 
      label: 'Business', 
      icon: Users, 
      menuId: 'business_menu',
      colorClass: 'bg-amber-500',
      description: 'Manage customers and relationships',
      children: [
          { label: 'Customers', path: '/customers', icon: Users, resource: 'Customer', description: 'Manage your customer database' },
      ]
  },
  { 
      label: 'Settings', 
      icon: Users, 
      menuId: 'access_control',
      colorClass: 'bg-purple-500',
      description: 'User management and permissions',
      children: [
          { label: 'Users', path: '/users', icon: UserCircle, resource: 'User', description: 'Manage platform users' },
          { label: 'Roles', path: '/roles', icon: Shield, resource: 'Role', description: 'Define user roles and permissions' }
      ]
  },
];
