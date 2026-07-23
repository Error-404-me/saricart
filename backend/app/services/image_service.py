import cloudinary.uploader


def upload_image(file):

    result = cloudinary.uploader.upload(
        file,
        folder="saricart/products"
    )

    return result["secure_url"]