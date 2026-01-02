export const DEFAULT_AVATAR = 'https://res.cloudinary.com/dnjrnglhu/image/upload/v1767360771/download_u6pgdn.jpg';

export const getAvatarSrc = (profileImage) => {
    return profileImage || DEFAULT_AVATAR;
};