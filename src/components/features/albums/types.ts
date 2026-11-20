/** 相册卡片组件的入参类型定义 */
import type { AlbumGroup } from "../../../types/album";

/** 相册卡片入参：完整的相册分组数据。 */
export interface AlbumCardProps {
	album: AlbumGroup;
}

/** 照片卡片入参：图片地址、替代文本与所属相册标识（用于灯箱分组）。 */
export interface PhotoCardProps {
	src: string;
	alt?: string;
	albumId: string;
}
