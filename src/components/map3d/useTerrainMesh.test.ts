/**
 * useTerrainMesh 测试
 *
 * 验证 DEM 地形加载: 成功 case = fallback 地形生成，函数不抛错并返回 THREE.Mesh。
 * 在 jsdom 测试环境中，`/terrain/chishui-dem.tif` 肯定不存在，所以总是走 fallback 路径。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as THREE from 'three'
import { loadTerrainMesh } from './useTerrainMesh'

/**
 * 最小化的 WebGL mock (用于创建 scene/renderer 不崩溃)
 */
function buildMinimalGL(): any {
  const gl: any = {}
  const constants: Record<string, number> = {
    VERTEX_SHADER: 0x8b31, FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81, LINK_STATUS: 0x8b82,
    TRIANGLES: 0x0004, LINES: 0x0001, POINTS: 0x0000,
    ARRAY_BUFFER: 0x8892, ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4, DYNAMIC_DRAW: 0x88e8,
    TEXTURE_2D: 0x0de1, TEXTURE0: 0x84c0,
    RGBA: 0x1908, UNSIGNED_BYTE: 0x1401, FLOAT: 0x1406,
    CULL_FACE: 0x0b44, DEPTH_TEST: 0x0b71, BLEND: 0x0be2,
    SRC_ALPHA: 0x0302, ONE_MINUS_SRC_ALPHA: 0x0303,
    BACK: 0x0405, CW: 0x0900, LEQUAL: 0x0203, LESS: 0x0201,
    NEAREST: 0x2600, LINEAR: 0x2601,
    CLAMP_TO_EDGE: 0x812f, REPEAT: 0x2901,
    COLOR_BUFFER_BIT: 0x4000, DEPTH_BUFFER_BIT: 0x0100,
    VERSION: 0x1f02, RENDERER: 0x1f01, VENDOR: 0x1f00,
    SHADING_LANGUAGE_VERSION: 0x8b8c,
    MAX_TEXTURE_SIZE: 0x0d33, MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8b4d,
    VIEWPORT: 0x0ba2, SCISSOR_BOX: 0x0c10,
    MAX_VERTEX_ATTRIBS: 0x8869, MAX_TEXTURE_IMAGE_UNITS: 0x8872,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8b4c,
    MAX_VERTEX_UNIFORM_VECTORS: 0x8dfb,
    MAX_FRAGMENT_UNIFORM_VECTORS: 0x8b49,
    MAX_UNIFORM_BUFFER_BINDINGS: 0x8a2f,
    MAX_SAMPLES: 0x8d57, SAMPLES: 0x80a9,
    ALIASED_LINE_WIDTH_RANGE: 0x846e, ALIASED_POINT_SIZE_RANGE: 0x846d,
    RED_BITS: 0x0d52, GREEN_BITS: 0x0d53, BLUE_BITS: 0x0d54, ALPHA_BITS: 0x0d55,
    DEPTH_BITS: 0x0d56, STENCIL_BITS: 0x0d57,
    MAX_UNIFORM_BLOCK_SIZE: 0x8a30, UNIFORM_BUFFER_OFFSET_ALIGNMENT: 0x8a34,
    IMPLEMENTATION_COLOR_READ_FORMAT: 0x8b9b, IMPLEMENTATION_COLOR_READ_TYPE: 0x8b9a,
    TEXTURE_MAX_ANISOTROPY_EXT: 0x84fe, MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84ff,
  }
  Object.assign(gl, constants)
  gl.getParameter = vi.fn((pname: number) => {
    const map = new Map<number, any>([
      [constants.VERSION, 'WebGL 2.0 Mock'],
      [constants.RENDERER, 'Mock Renderer'],
      [constants.VENDOR, 'Mock Vendor'],
      [constants.SHADING_LANGUAGE_VERSION, 'WebGL GLSL ES 3.00'],
      [constants.MAX_TEXTURE_SIZE, 8192], [constants.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 32],
      [constants.VIEWPORT, new Int32Array([0, 0, 100, 100])],
      [constants.SCISSOR_BOX, new Int32Array([0, 0, 100, 100])],
      [constants.MAX_TEXTURE_IMAGE_UNITS, 16],
      [constants.MAX_VERTEX_TEXTURE_IMAGE_UNITS, 16],
      [constants.MAX_VERTEX_ATTRIBS, 16],
      [constants.ALIASED_LINE_WIDTH_RANGE, new Float32Array([1, 1])],
      [constants.ALIASED_POINT_SIZE_RANGE, new Float32Array([1, 64])],
      [constants.RED_BITS, 8], [constants.GREEN_BITS, 8], [constants.BLUE_BITS, 8], [constants.ALPHA_BITS, 8],
      [constants.DEPTH_BITS, 24], [constants.STENCIL_BITS, 8],
      [constants.SAMPLES, 4], [constants.MAX_SAMPLES, 8],
      [constants.MAX_UNIFORM_BUFFER_BINDINGS, 72],
      [constants.IMPLEMENTATION_COLOR_READ_FORMAT, constants.RGBA],
      [constants.IMPLEMENTATION_COLOR_READ_TYPE, constants.UNSIGNED_BYTE],
    ])
    return map.has(pname) ? map.get(pname) : null
  })
  gl.getContextAttributes = vi.fn(() => ({ alpha: true, antialias: false, depth: true, stencil: true }))
  gl.getExtension = vi.fn(() => null)
  gl.getShaderPrecisionFormat = vi.fn(() => ({ rangeMin: 0, rangeMax: 0, precision: 0 }))
  gl.getError = vi.fn(() => 0)
  gl.isContextLost = vi.fn(() => false)
  gl.isEnabled = vi.fn(() => false)
  gl.getShaderParameter = vi.fn(() => true)
  gl.getProgramParameter = vi.fn(() => true)
  gl.getShaderInfoLog = vi.fn(() => '')
  gl.getProgramInfoLog = vi.fn(() => '')
  gl.getAttribLocation = vi.fn(() => 0)
  gl.getUniformLocation = vi.fn(() => ({}))
  gl.getActiveUniform = vi.fn(() => ({ name: '', size: 0, type: 0x1406 }))
  gl.getActiveAttrib = vi.fn(() => ({ name: '', size: 0, type: 0x1406 }))
  gl.getUniformBlockIndex = vi.fn(() => 0)
  gl.getFragDataLocation = vi.fn(() => 0)
  gl.checkFramebufferStatus = vi.fn(() => 0x8cd5)

  // 返回对象
  const createObj = vi.fn(() => ({}))
  gl.createShader = createObj; gl.createProgram = createObj; gl.createBuffer = createObj
  gl.createTexture = createObj; gl.createFramebuffer = createObj; gl.createRenderbuffer = createObj
  gl.createVertexArray = createObj; gl.createQuery = createObj; gl.createSampler = createObj
  gl.createTransformFeedback = createObj

  // void 函数
  const noop = vi.fn()
  const voidFns = [
    'viewport', 'clear', 'clearColor', 'enable', 'disable', 'depthFunc',
    'colorMask', 'cullFace', 'frontFace', 'blendFunc', 'useProgram',
    'bindBuffer', 'bufferData', 'bufferSubData',
    'enableVertexAttribArray', 'vertexAttribPointer',
    'shaderSource', 'compileShader', 'attachShader', 'linkProgram',
    'uniformMatrix4fv', 'uniform1i', 'uniform1f', 'uniform3f', 'uniform4f',
    'activeTexture', 'bindTexture', 'texImage2D', 'texParameteri',
    'drawArrays', 'drawElements', 'bindFramebuffer', 'framebufferTexture2D',
    'framebufferRenderbuffer', 'renderbufferStorage',
    'bindVertexArray', 'bindRenderbuffer', 'deleteShader', 'deleteProgram',
    'deleteBuffer', 'deleteTexture', 'deleteFramebuffer', 'deleteRenderbuffer',
    'vertexAttribDivisor', 'drawArraysInstanced', 'drawBuffers',
    'scissor', 'readBuffer', 'clearDepth', 'depthMask', 'blendFuncSeparate',
    'uniform2f', 'uniform2iv', 'uniform3iv', 'uniform4iv',
    'uniform1fv', 'uniform2fv', 'uniform3fv', 'uniform4fv',
    'uniformMatrix2fv', 'uniformMatrix3fv',
    'uniformBlockBinding', 'bindBufferBase', 'bindBufferRange',
    'bindSampler', 'samplerParameteri',
    'pixelStorei', 'generateMipmap', 'stencilFunc', 'stencilOp',
    'polygonOffset', 'lineWidth', 'flush',
    'bindTransformFeedback', 'beginTransformFeedback', 'endTransformFeedback',
    'invalidateFramebuffer', 'clearBufferfv',
  ]
  for (const name of voidFns) { gl[name] = noop }

  gl.canvas = null
  gl.drawingBufferWidth = 100
  gl.drawingBufferHeight = 100
  return gl
}

describe('loadTerrainMesh', () => {
  let scene: THREE.Scene
  let glMock: ReturnType<typeof vi.spyOn>
  let rafMock: ReturnType<typeof vi.spyOn>
  let cafMock: ReturnType<typeof vi.spyOn>
  let fetchMock: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Mock WebGL context
    glMock = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: any) {
      const gl = buildMinimalGL()
      gl.canvas = this
      return gl
    })

    // Mock RAF (prevent animate loop)
    rafMock = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    cafMock = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    // Mock fetch (DEM 文件不存在 → 触发 fallback)
    fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('File not found'))

    scene = new THREE.Scene()
  })

  afterEach(() => {
    glMock?.mockRestore()
    rafMock?.mockRestore()
    cafMock?.mockRestore()
    fetchMock?.mockRestore()
    vi.restoreAllMocks()
  })

  it('should return a THREE.Mesh (never throws)', async () => {
    const mesh = await loadTerrainMesh(scene)

    expect(mesh).toBeDefined()
    expect(mesh).not.toBeNull()
    expect(mesh).toBeInstanceOf(THREE.Mesh)
  })

  it('should add mesh to scene', async () => {
    const mesh = await loadTerrainMesh(scene)

    // 验证 mesh 已添加到 scene
    expect(scene.children).toContain(mesh)
  })

  it('should apply vertex colors to geometry', async () => {
    const mesh = await loadTerrainMesh(scene)

    // 验证几何体有颜色属性
    expect(mesh.geometry.attributes.color).toBeDefined()
    expect(mesh.geometry.attributes.color.count).toBeGreaterThan(0)
  })

  it('should use MeshLambertMaterial with vertexColors', async () => {
    const mesh = await loadTerrainMesh(scene)

    // 验证材质类型
    const mat = mesh.material as THREE.MeshLambertMaterial
    expect(mat).toBeInstanceOf(THREE.MeshLambertMaterial)
    expect(mat.vertexColors).toBe(true)
  })

  it('should rotate mesh to be horizontal', async () => {
    const mesh = await loadTerrainMesh(scene)

    // 验证旋转 -PI/2 around X axis (PlaneGeometry 默认在 XY 平面)
    expect(mesh.rotation.x).toBeCloseTo(-Math.PI / 2, 2)
  })

  it('should handle custom options', async () => {
    const mesh = await loadTerrainMesh(scene, {
      width: 500,
      height: 500,
      widthSegments: 64,
      heightSegments: 64,
      heightExaggeration: 2,
      noiseAmplitude: 10,
    })

    expect(mesh).toBeInstanceOf(THREE.Mesh)
  })
})
