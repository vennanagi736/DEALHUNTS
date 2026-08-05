export const createImage = (url) =>
    new Promise((resolve, reject) => {

        const image = new Image();

        image.setAttribute(
            "crossOrigin",
            "anonymous"
        );

        image.onload = () => resolve(image);

        image.onerror = reject;

        image.src = url;

    });


export default async function getCroppedImg(
    imageSrc,
    crop
){

    const image = await createImage(imageSrc);


    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");


    // Fixed banner size
    const width = 1600;
    const height = 500;


    canvas.width = width;
    canvas.height = height;


    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        width,
        height
    );


    return new Promise((resolve)=>{

        canvas.toBlob(
            (blob)=>{

                const file = new File(
                    [blob],
                    "banner.jpg",
                    {
                        type:"image/jpeg"
                    }
                );

                resolve(file);

            },
            "image/jpeg",
            0.92
        );
    });
}