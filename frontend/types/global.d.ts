// types/global.d.ts

declare module "*.jpg";
declare module "*.png";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.css";

// nếu bạn muốn thêm type global, ví dụ:
declare global {
    interface Window {
        myCustomApp?: string;
    }
}
