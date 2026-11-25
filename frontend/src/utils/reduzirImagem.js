// Reduz fotos no navegador antes do envio: foto de celular (3–8 MB, 4000px)
// vira algumas centenas de KB, sem perda visível nos tamanhos em que o app mostra.

// Tamanho máximo do arquivo ORIGINAL que as telas aceitam: ele é reduzido antes do envio,
// então chega ao servidor bem abaixo dos limites do backend (2 MB / 4 MB).
export const TAMANHO_MAXIMO_ORIGINAL = 15 * 1024 * 1024;
export const TEXTO_TAMANHO_MAXIMO = '15 MB';

const LADO_MAXIMO = 1600; // px no lado maior
const QUALIDADE = 0.85;
const TIPOS_REDUZIVEIS = ['image/jpeg', 'image/png', 'image/webp'];
const PEQUENA_O_SUFICIENTE = 400 * 1024; // abaixo disso e já dentro do tamanho, envia como está

async function carregarImagem(arquivo) {
  // createImageBitmap já aplica a rotação da câmera (EXIF) nos navegadores atuais
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
    } catch {
      // cai para o <img> abaixo
    }
  }
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function paraBlob(canvas, tipo) {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, QUALIDADE));
}

// Devolve um File menor, ou o próprio arquivo se não der para reduzir
// (tipo não suportado, já pequeno, erro do navegador ou resultado maior que o original).
export async function reduzirImagem(arquivo) {
  if (!(arquivo instanceof File) || !TIPOS_REDUZIVEIS.includes(arquivo.type)) return arquivo;

  try {
    const imagem = await carregarImagem(arquivo);
    const largura = imagem.width;
    const altura = imagem.height;
    const escala = Math.min(1, LADO_MAXIMO / Math.max(largura, altura));
    if (escala === 1 && arquivo.size <= PEQUENA_O_SUFICIENTE) return arquivo;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(largura * escala);
    canvas.height = Math.round(altura * escala);
    const contexto = canvas.getContext('2d');

    // PNG pode ter transparência: mantém PNG. JPEG e WEBP viram JPEG (menor e aceito em todo navegador).
    const tipoSaida = arquivo.type === 'image/png' ? 'image/png' : 'image/jpeg';
    if (tipoSaida === 'image/jpeg') {
      contexto.fillStyle = '#ffffff'; // fundo branco no lugar de transparência
      contexto.fillRect(0, 0, canvas.width, canvas.height);
    }
    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    imagem.close?.();

    const blob = await paraBlob(canvas, tipoSaida);
    if (!blob || blob.size >= arquivo.size) return arquivo;

    const extensao = tipoSaida === 'image/png' ? 'png' : 'jpg';
    const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.' + extensao;
    return new File([blob], nome, { type: tipoSaida, lastModified: Date.now() });
  } catch {
    return arquivo; // na dúvida, envia o original (o backend ainda valida o tamanho)
  }
}

// Copia o FormData reduzindo as imagens que estiverem nele; o resto vai igual.
export async function reduzirImagensDoFormulario(formulario) {
  const novo = new FormData();
  for (const [campo, valor] of formulario.entries()) {
    novo.append(campo, valor instanceof File ? await reduzirImagem(valor) : valor);
  }
  return novo;
}
