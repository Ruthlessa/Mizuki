/**
 * 相册相关的数据结构定义：单张照片与相册分组。
 * 供相册页面、照片墙组件与内容集合解析时共享类型。
 */

/** 一张相册照片的元数据，除 src 外均为可选展示信息 */
export interface Photo {
	id?: string;
	src: string;
	alt?: string;
	title?: string;
	thumbnail?: string;
	tags?: string[];
	description?: string;
	date?: string;
	location?: string;
	width?: number;
	height?: number;
}

/** 一个相册分组：包含封面、日期与照片列表，用于相册页分组展示 */
export interface AlbumGroup {
	id: string;
	title: string;
	description?: string;
	cover: string;
	date: string;
	location?: string;
	tags?: string[];
	photos: Photo[];
}
