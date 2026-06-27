/**
 * useThreeSetup 测试
 *
 * 验证 Three.js 场景初始化、相机/渲染器创建、dispose 清理。
 * jsdom 环境通过 mock HTMLCanvasElement.prototype.getContext 来支持 Three.js。
 * 此 mock 旨在让 WebGLRenderer 构造函数不崩溃，返回可用的 scene/camera/renderer 对象。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import * as THREE from 'three'
import { useThreeSetup } from './useThreeSetup'

/**
 * 构建完整的 WebGL2RenderingContext mock 对象。
 * 关键挑战: Three.js 读取 gl.VERSION / gl.RENDERER 等属性作为 getParameter 参数，
 * 并通过 getParameter 获取 GPU 信息字符串。这些字符串不能被 Proxy 拦截丢失。
 */
function buildMockGL(): any {
  const gl: any = {}

  // ===== WebGL 常量 (作为 gl 的属性) =====
  const constants: Record<string, number> = {
    NO_ERROR: 0,
    FRAMEBUFFER_COMPLETE: 0x8cd5,
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    TRIANGLES: 0x0004,
    TRIANGLE_STRIP: 0x0005,
    LINES: 0x0001,
    LINE_STRIP: 0x0003,
    LINE_LOOP: 0x0002,
    POINTS: 0x0000,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4,
    DYNAMIC_DRAW: 0x88e8,
    STREAM_DRAW: 0x88e0,
    TEXTURE_2D: 0x0de1,
    TEXTURE_CUBE_MAP: 0x8513,
    TEXTURE_3D: 0x806f,
    TEXTURE0: 0x84c0,
    TEXTURE1: 0x84c1,
    TEXTURE2: 0x84c2,
    TEXTURE3: 0x84c3,
    TEXTURE4: 0x84c4,
    TEXTURE5: 0x84c5,
    TEXTURE6: 0x84c6,
    TEXTURE7: 0x84c7,
    RGBA: 0x1908,
    RGB: 0x1907,
    RG: 0x8227,
    RED: 0x1903,
    ALPHA: 0x1906,
    DEPTH_COMPONENT: 0x1902,
    DEPTH_STENCIL: 0x84f9,
    UNSIGNED_BYTE: 0x1401,
    UNSIGNED_SHORT: 0x1403,
    UNSIGNED_INT: 0x1405,
    FLOAT: 0x1406,
    HALF_FLOAT: 0x140b,
    CULL_FACE: 0x0b44,
    DEPTH_TEST: 0x0b71,
    BLEND: 0x0be2,
    SCISSOR_TEST: 0x0c11,
    STENCIL_TEST: 0x0b90,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    ONE: 0x0001,
    ZERO: 0x0000,
    BACK: 0x0405,
    FRONT: 0x0404,
    CCW: 0x0901,
    CW: 0x0900,
    LEQUAL: 0x0203,
    LESS: 0x0201,
    GREATER: 0x0204,
    GEQUAL: 0x0206,
    ALWAYS: 0x0207,
    NEVER: 0x0200,
    NEAREST: 0x2600,
    LINEAR: 0x2601,
    NEAREST_MIPMAP_NEAREST: 0x2700,
    LINEAR_MIPMAP_LINEAR: 0x2703,
    CLAMP_TO_EDGE: 0x812f,
    REPEAT: 0x2901,
    MIRRORED_REPEAT: 0x8370,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    STENCIL_BUFFER_BIT: 0x0400,
    // WebGL renderer info (keys used as gl properties AND getParameter args)
    VERSION: 0x1f02,
    RENDERER: 0x1f01,
    VENDOR: 0x1f00,
    SHADING_LANGUAGE_VERSION: 0x8b8c,
    // Limits
    MAX_TEXTURE_SIZE: 0x0d33,
    MAX_CUBE_MAP_TEXTURE_SIZE: 0x851c,
    MAX_RENDERBUFFER_SIZE: 0x84e8,
    MAX_TEXTURE_IMAGE_UNITS: 0x8872,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8b4c,
    MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8b4d,
    MAX_VERTEX_ATTRIBS: 0x8869,
    MAX_VARYING_VECTORS: 0x8dfc,
    MAX_VERTEX_UNIFORM_VECTORS: 0x8dfb,
    MAX_FRAGMENT_UNIFORM_VECTORS: 0x8b49,
    MAX_UNIFORM_BUFFER_BINDINGS: 0x8a2f,
    MAX_DRAW_BUFFERS: 0x8824,
    MAX_SAMPLES: 0x8d57,
    MAX_3D_TEXTURE_SIZE: 0x8073,
    MAX_ARRAY_TEXTURE_LAYERS: 0x88ff,
    ALIASED_LINE_WIDTH_RANGE: 0x846e,
    ALIASED_POINT_SIZE_RANGE: 0x846d,
    RED_BITS: 0x0d52,
    GREEN_BITS: 0x0d53,
    BLUE_BITS: 0x0d54,
    ALPHA_BITS: 0x0d55,
    DEPTH_BITS: 0x0d56,
    STENCIL_BITS: 0x0d57,
    VIEWPORT: 0x0ba2,
    SCISSOR_BOX: 0x0c10,
    COMPRESSED_TEXTURE_FORMATS: 0x86a3,
    MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: 0x8c8b,
    MAX_UNIFORM_BLOCK_SIZE: 0x8a30,
    UNIFORM_BUFFER_OFFSET_ALIGNMENT: 0x8a34,
    // WebGL2
    TEXTURE_MAX_ANISOTROPY_EXT: 0x84fe,
    MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84ff,
    UNIFORM_BUFFER: 0x8a11,
    READ_FRAMEBUFFER: 0x8ca8,
    DRAW_FRAMEBUFFER: 0x8ca9,
    INTERLEAVED_ATTRIBS: 0x8c8c,
    SEPARATE_ATTRIBS: 0x8c8d,
    SAMPLER_2D_SHADOW: 0x8b62,
    COMPARE_REF_TO_TEXTURE: 0x884e,
    TEXTURE_COMPARE_MODE: 0x884c,
    TEXTURE_COMPARE_FUNC: 0x884d,
    SAMPLES: 0x80a9,
    IMPLEMENTATION_COLOR_READ_FORMAT: 0x8b9b,
    IMPLEMENTATION_COLOR_READ_TYPE: 0x8b9a,
  }

  // 将常量直接赋给 gl
  Object.assign(gl, constants)

  // ===== 初始化虚拟对象映射 =====
  // Three.js 使用 WeakMap 存储 WebGL 对象引用,因此必须是 object 而非 number
  function newGlObject(label: string): Record<string, unknown> {
    return { _type: label, _id: Math.random() }
  }

  // ===== getParameter 映射 =====
  const paramMap = new Map<number, any>([
    [constants.VERSION, 'WebGL 2.0 (OpenGL ES 3.0 Mock)'],
    [constants.RENDERER, 'Mock WebGL Renderer'],
    [constants.VENDOR, 'Mock GPU Vendor'],
    [constants.SHADING_LANGUAGE_VERSION, 'WebGL GLSL ES 3.00'],
    [constants.MAX_TEXTURE_SIZE, 8192],
    [constants.MAX_CUBE_MAP_TEXTURE_SIZE, 8192],
    [constants.MAX_RENDERBUFFER_SIZE, 8192],
    [constants.MAX_TEXTURE_IMAGE_UNITS, 16],
    [constants.MAX_VERTEX_TEXTURE_IMAGE_UNITS, 16],
    [constants.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 32],
    [constants.MAX_VERTEX_ATTRIBS, 16],
    [constants.MAX_VARYING_VECTORS, 32],
    [constants.MAX_VERTEX_UNIFORM_VECTORS, 4096],
    [constants.MAX_FRAGMENT_UNIFORM_VECTORS, 4096],
    [constants.MAX_UNIFORM_BUFFER_BINDINGS, 72],
    [constants.MAX_DRAW_BUFFERS, 8],
    [constants.MAX_SAMPLES, 8],
    [constants.MAX_3D_TEXTURE_SIZE, 2048],
    [constants.MAX_ARRAY_TEXTURE_LAYERS, 256],
    [constants.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS, 4],
    [constants.MAX_UNIFORM_BLOCK_SIZE, 65536],
    [constants.UNIFORM_BUFFER_OFFSET_ALIGNMENT, 256],
    [constants.ALIASED_LINE_WIDTH_RANGE, new Float32Array([1, 1])],
    [constants.ALIASED_POINT_SIZE_RANGE, new Float32Array([1, 64])],
    [constants.RED_BITS, 8],
    [constants.GREEN_BITS, 8],
    [constants.BLUE_BITS, 8],
    [constants.ALPHA_BITS, 8],
    [constants.DEPTH_BITS, 24],
    [constants.STENCIL_BITS, 8],
    [constants.VIEWPORT, new Int32Array([0, 0, 800, 600])],
    [constants.SCISSOR_BOX, new Int32Array([0, 0, 800, 600])],
    [constants.SAMPLES, 4],
    [constants.IMPLEMENTATION_COLOR_READ_FORMAT, constants.RGBA],
    [constants.IMPLEMENTATION_COLOR_READ_TYPE, constants.UNSIGNED_BYTE],
    [constants.COMPRESSED_TEXTURE_FORMATS, new Uint32Array(0)],
  ])

  gl.getParameter = vi.fn((pname: number) => {
    if (paramMap.has(pname)) return paramMap.get(pname)
    return null
  })

  // ===== 有返回值的函数 =====
  gl.createShader = vi.fn(() => newGlObject('shader'))
  gl.createProgram = vi.fn(() => newGlObject('program'))
  gl.createBuffer = vi.fn(() => newGlObject('buffer'))
  gl.createTexture = vi.fn(() => newGlObject('texture'))
  gl.createFramebuffer = vi.fn(() => newGlObject('framebuffer'))
  gl.createRenderbuffer = vi.fn(() => newGlObject('renderbuffer'))
  gl.createVertexArray = vi.fn(() => newGlObject('vertexArray'))
  gl.createQuery = vi.fn(() => newGlObject('query'))
  gl.createSampler = vi.fn(() => newGlObject('sampler'))
  gl.createTransformFeedback = vi.fn(() => newGlObject('transformFeedback'))

  gl.getShaderParameter = vi.fn(() => true)
  gl.getProgramParameter = vi.fn(() => true)
  gl.getShaderInfoLog = vi.fn(() => '')
  gl.getProgramInfoLog = vi.fn(() => '')
  gl.getAttribLocation = vi.fn(() => 0)
  gl.getUniformLocation = vi.fn(() => ({ value: 0 }))
  gl.getError = vi.fn(() => 0)
  gl.getContextAttributes = vi.fn(() => ({
    alpha: true,
    antialias: true,
    depth: true,
    stencil: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'default',
    failIfMajorPerformanceCaveat: false,
    desynchronized: false,
  }))
  gl.isContextLost = vi.fn(() => false)
  gl.isEnabled = vi.fn(() => false)
  gl.getShaderPrecisionFormat = vi.fn(() => ({ rangeMin: 0, rangeMax: 0, precision: 0 }))
  gl.checkFramebufferStatus = vi.fn(() => 0x8cd5)
  gl.getActiveUniform = vi.fn(() => ({ name: '', size: 0, type: 0x1406 }))
  gl.getActiveAttrib = vi.fn(() => ({ name: '', size: 0, type: 0x1406 }))
  gl.getUniformBlockIndex = vi.fn(() => 0)
  gl.getFragDataLocation = vi.fn(() => 0)
  gl.getBufferSubData = vi.fn(() => undefined)

  gl.getExtension = vi.fn((name: string) => {
    // Three.js queries many extensions; only some are essential
    const essential = [
      'EXT_texture_filter_anisotropic',
      'OES_texture_float',
      'OES_texture_half_float',
      'EXT_color_buffer_float',
      'OES_standard_derivatives',
      'OES_element_index_uint',
      'EXT_frag_depth',
      'EXT_shader_texture_lod',
      'WEBGL_depth_texture',
      'EXT_color_buffer_half_float',
      'WEBGL_multi_draw',
      'OVR_multiview2',
      'WEBGL_compressed_texture_s3tc',
      'WEBGL_compressed_texture_etc1',
      'WEBGL_compressed_texture_pvrtc',
      'WEBGL_compressed_texture_astc',
      'EXT_disjoint_timer_query_webgl2',
      'EXT_depth_clamp',
      'KHR_parallel_shader_compile',
      'WEBGL_clip_cull_distance',
      'WEBGL_draw_instanced_base_vertex_base_instance',
      'WEBGL_multi_draw_instanced_base_vertex_base_instance',
    ]
    return essential.includes(name) ? {} : null
  })

  // ===== 批量 void 函数 =====
  const voidFns = [
    'viewport', 'clear', 'clearColor', 'clearDepth', 'clearStencil',
    'enable', 'disable', 'depthFunc', 'depthMask', 'colorMask',
    'scissor', 'cullFace', 'frontFace', 'blendFunc', 'blendFuncSeparate',
    'bindBuffer', 'bufferData', 'bufferSubData',
    'shaderSource', 'compileShader', 'attachShader', 'linkProgram',
    'useProgram', 'enableVertexAttribArray', 'vertexAttribPointer',
    'uniformMatrix4fv', 'uniform1i', 'uniform1f', 'uniform2f',
    'uniform3f', 'uniform4f', 'uniform1iv', 'uniform2iv',
    'uniform3iv', 'uniform4iv', 'uniform1fv', 'uniform2fv',
    'uniform3fv', 'uniform4fv', 'uniformMatrix2fv', 'uniformMatrix3fv',
    'uniformBlockBinding', 'bindBufferBase', 'bindBufferRange',
    'activeTexture', 'bindTexture', 'texImage2D', 'texImage3D',
    'texParameteri', 'texParameterf', 'texSubImage2D',
    'generateMipmap', 'pixelStorei',
    'drawArrays', 'drawElements', 'drawArraysInstanced',
    'bindFramebuffer', 'framebufferTexture2D', 'framebufferRenderbuffer',
    'renderbufferStorage', 'readBuffer', 'drawBuffers',
    'bindRenderbuffer', 'vertexAttribDivisor',
    'bindVertexArray', 'deleteShader', 'deleteProgram',
    'deleteBuffer', 'deleteTexture', 'deleteFramebuffer',
    'deleteRenderbuffer', 'deleteVertexArray', 'deleteQuery',
    'deleteSampler', 'deleteTransformFeedback',
    'bindTransformFeedback', 'beginTransformFeedback',
    'endTransformFeedback', 'transformFeedbackVaryings',
    'bindSampler', 'samplerParameteri', 'samplerParameterf',
    'invalidateFramebuffer', 'readPixels',
    'polygonOffset', 'lineWidth', 'stencilFunc', 'stencilOp',
    'stencilMask', 'flush', 'finish',
    'vertexAttribIPointer', 'vertexAttribI4ui',
    'uniform1ui', 'uniform2ui', 'uniform3ui', 'uniform4ui',
    'clearBufferfv', 'clearBufferiv', 'clearBufferuiv',
    'clearBufferfi', 'texStorage2D', 'texStorage3D',
    'blitFramebuffer', 'invalidateSubFramebuffer',
    'fenceSync', 'deleteSync', 'clientWaitSync',
    'getQueryParameter', 'beginQuery', 'endQuery',
    'uniformMatrix2x3fv', 'uniformMatrix3x2fv',
    'uniformMatrix2x4fv', 'uniformMatrix4x2fv',
    'uniformMatrix3x4fv', 'uniformMatrix4x3fv',
    'uniform2ui', 'uniform3ui', 'uniform4ui',
    'bindImageTexture', 'memoryBarrier',
    'hint', 'stencilOpSeparate', 'stencilFuncSeparate',
    'stencilMaskSeparate', 'texSubImage3D', 'copyTexSubImage3D',
    'compressedTexImage2D', 'compressedTexImage3D', 'compressedTexSubImage2D',
    'copyTexImage2D', 'copyTexSubImage2D',
    'renderbufferStorageMultisample', 'vertexAttrib1f', 'vertexAttrib2f',
    'vertexAttrib3f', 'vertexAttrib4f',
  ]
  for (const name of voidFns) {
    gl[name] = vi.fn()
  }

  // ===== 特殊属性 =====
  // WebGL 上下文标识
  gl.canvas = null // 由 renderer 设置
  gl.drawingBufferWidth = 800
  gl.drawingBufferHeight = 600
  gl.drawingBufferColorSpace = 'srgb'

  return gl
}

describe('useThreeSetup', () => {
  let container: HTMLElement
  let containerRef: ReturnType<typeof ref<HTMLElement | null>>
  let getContextMock: ReturnType<typeof vi.spyOn>
  let rafCallbacks: Array<FrameRequestCallback>

  beforeEach(() => {
    // Mock requestAnimationFrame: 收集回调但不自动执行
    // jsdom 的 RAF polyfill 可能同步触发,导致 renderer.render 在 mock 不完整时崩溃
    rafCallbacks = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length // 返回非零 timer ID
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((_id: number) => {
      // no-op
    })

    getContextMock = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(function (this: HTMLCanvasElement) {
        const gl = buildMockGL()
        gl.canvas = this as any
        return gl
      })

    container = document.createElement('div')
    Object.defineProperty(container, 'clientWidth', { value: 800, writable: true, configurable: true })
    Object.defineProperty(container, 'clientHeight', { value: 600, writable: true, configurable: true })
    document.body.appendChild(container)

    containerRef = ref(container)
  })

  afterEach(() => {
    if (container.parentElement) {
      container.parentElement.removeChild(container)
    }
    getContextMock?.mockRestore()
    vi.restoreAllMocks()
  })

  it('should create scene, camera, and renderer (all non-null)', () => {
    const ctx = useThreeSetup(containerRef)

    expect(ctx.scene).toBeDefined()
    expect(ctx.scene).not.toBeNull()
    expect(ctx.scene).toBeInstanceOf(THREE.Scene)

    expect(ctx.camera).toBeDefined()
    expect(ctx.camera).not.toBeNull()
    expect(ctx.camera).toBeInstanceOf(THREE.PerspectiveCamera)

    expect(ctx.renderer).toBeDefined()
    expect(ctx.renderer).not.toBeNull()
    expect(ctx.renderer).toBeInstanceOf(THREE.WebGLRenderer)

    // 验证相机初始位置 (鸟瞰 - 从上方俯视)
    expect(ctx.camera.position.y).toBeGreaterThan(0)

    ctx.dispose()
  })

  it('should clean up canvas child elements on dispose', () => {
    const ctx = useThreeSetup(containerRef)

    // 验证 renderer.domElement 已添加到容器
    expect(ctx.renderer.domElement).toBeInstanceOf(HTMLCanvasElement)
    expect(container.contains(ctx.renderer.domElement)).toBe(true)

    const canvasEl = ctx.renderer.domElement

    ctx.dispose()

    // dispose 后 canvas 应从 DOM 移除
    expect(container.contains(canvasEl)).toBe(false)
  })
})
