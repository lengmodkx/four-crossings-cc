/**
 * useForce3D 测试
 *
 * 验证 3D 部队楔形箭头创建: 返回 THREE.Mesh 对象，颜色与部队 side 匹配。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as THREE from 'three'
import { createForceArrow, defaultLngLatToWorldXY } from './useForce3D'
import type { ForceFeature, LngLat } from '@/data/types'

/**
 * 最小化 WebGL mock (scene 创建可能触发 renderer 相关调用)
 */
function buildMinimalGL(): any {
  const gl: any = {}
  const constants: Record<string, number> = {
    VERTEX_SHADER: 0x8b31, FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81, LINK_STATUS: 0x8b82,
    TRIANGLES: 0x0004, LINES: 0x0001,
    ARRAY_BUFFER: 0x8892, ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4, DYNAMIC_DRAW: 0x88e8,
    TEXTURE_2D: 0x0de1, TEXTURE0: 0x84c0,
    RGBA: 0x1908, UNSIGNED_BYTE: 0x1401, FLOAT: 0x1406,
    CULL_FACE: 0x0b44, DEPTH_TEST: 0x0b71, BLEND: 0x0be2,
    SRC_ALPHA: 0x0302, ONE_MINUS_SRC_ALPHA: 0x0303,
    ONE: 0x0001, ZERO: 0x0000, BACK: 0x0405, CW: 0x0900, LEQUAL: 0x0203,
    NEAREST: 0x2600, LINEAR: 0x2601,
    CLAMP_TO_EDGE: 0x812f, REPEAT: 0x2901,
    COLOR_BUFFER_BIT: 0x4000, DEPTH_BUFFER_BIT: 0x0100,
    VERSION: 0x1f02, RENDERER: 0x1f01, VENDOR: 0x1f00,
    SHADING_LANGUAGE_VERSION: 0x8b8c,
    MAX_TEXTURE_SIZE: 0x0d33, MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8b4d,
    MAX_VERTEX_ATTRIBS: 0x8869, MAX_TEXTURE_IMAGE_UNITS: 0x8872,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8b4c, MAX_SAMPLES: 0x8d57,
    ALIASED_LINE_WIDTH_RANGE: 0x846e, ALIASED_POINT_SIZE_RANGE: 0x846d,
    VIEWPORT: 0x0ba2, SCISSOR_BOX: 0x0c10,
    RED_BITS: 0x0d52, GREEN_BITS: 0x0d53, BLUE_BITS: 0x0d54, ALPHA_BITS: 0x0d55,
    DEPTH_BITS: 0x0d56, STENCIL_BITS: 0x0d57,
    MAX_UNIFORM_BUFFER_BINDINGS: 0x8a2f, MAX_UNIFORM_BLOCK_SIZE: 0x8a30,
    UNIFORM_BUFFER_OFFSET_ALIGNMENT: 0x8a34,
    IMPLEMENTATION_COLOR_READ_FORMAT: 0x8b9b, IMPLEMENTATION_COLOR_READ_TYPE: 0x8b9a,
    TEXTURE_MAX_ANISOTROPY_EXT: 0x84fe,
    SAMPLES: 0x80a9, COMPRESSED_TEXTURE_FORMATS: 0x86a3,
  }
  Object.assign(gl, constants)
  gl.getParameter = vi.fn((p: number) => {
    const m = new Map<number, any>([
      [constants.VERSION, 'WebGL 2.0 Mock'],
      [constants.RENDERER, 'Mock Renderer'],
      [constants.MAX_TEXTURE_SIZE, 8192], [constants.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 32],
      [constants.VIEWPORT, new Int32Array([0, 0, 100, 100])],
      [constants.SCISSOR_BOX, new Int32Array([0, 0, 100, 100])],
      [constants.ALIASED_LINE_WIDTH_RANGE, new Float32Array([1, 1])],
      [constants.ALIASED_POINT_SIZE_RANGE, new Float32Array([1, 64])],
      [constants.RED_BITS, 8], [constants.GREEN_BITS, 8],
      [constants.BLUE_BITS, 8], [constants.ALPHA_BITS, 8],
      [constants.DEPTH_BITS, 24], [constants.STENCIL_BITS, 8],
      [constants.SAMPLES, 4], [constants.MAX_SAMPLES, 8],
      [constants.MAX_UNIFORM_BUFFER_BINDINGS, 72],
      [constants.IMPLEMENTATION_COLOR_READ_FORMAT, constants.RGBA],
      [constants.IMPLEMENTATION_COLOR_READ_TYPE, constants.UNSIGNED_BYTE],
    ])
    return m.has(p) ? m.get(p) : null
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

  const createObj = vi.fn(() => ({}))
  gl.createShader = createObj; gl.createProgram = createObj; gl.createBuffer = createObj
  gl.createTexture = createObj; gl.createFramebuffer = createObj; gl.createRenderbuffer = createObj
  gl.createVertexArray = createObj; gl.createQuery = createObj; gl.createSampler = createObj

  const noop = vi.fn()
  ;[
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
    'scissor', 'readBuffer', 'clearDepth', 'depthMask',
    'uniform2f', 'uniform1fv', 'uniform2fv', 'uniform3fv', 'uniform4fv',
    'uniformMatrix2fv', 'uniformMatrix3fv',
    'uniformBlockBinding', 'bindBufferBase', 'bindBufferRange',
    'pixelStorei', 'generateMipmap', 'stencilFunc', 'stencilOp',
    'polygonOffset', 'flush', 'lineWidth',
    'bindTransformFeedback', 'beginTransformFeedback', 'endTransformFeedback',
    'invalidateFramebuffer', 'clearBufferfv',
    'vertexAttribIPointer', 'uniform1ui',
    'bindSampler', 'samplerParameteri',
    'hint', 'stencilOpSeparate', 'stencilFuncSeparate', 'stencilMaskSeparate',
    'copyTexImage2D', 'copyTexSubImage2D',
    'compressedTexImage2D', 'compressedTexSubImage2D',
    'renderbufferStorageMultisample',
  ].forEach(n => { gl[n] = noop })

  gl.canvas = null
  gl.drawingBufferWidth = 100
  gl.drawingBufferHeight = 100
  return gl
}

/** 创建 mock ForceFeature */
function makeForce(coords: LngLat, side: 'red' | 'blue', id = 'test-force'): ForceFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coords,
    },
    properties: {
      id,
      type: 'force',
      side,
      name: 'Test Force',
      level: 'army',
      commander: 'Test',
      strength: 10000,
      timestamp: '1935-01-20T00:00:00+08:00',
      status: 'marching',
      source: 'test',
    },
  }
}

describe('createForceArrow', () => {
  let scene: THREE.Scene
  let glMock: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    glMock = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: any) {
      const gl = buildMinimalGL()
      gl.canvas = this
      return gl
    })
    scene = new THREE.Scene()
  })

  afterEach(() => {
    glMock?.mockRestore()
    vi.restoreAllMocks()
  })

  it('should return mesh and glow as THREE.Mesh objects', () => {
    const force = makeForce([105.5, 28.0], 'red')
    const result = createForceArrow(force, scene)

    expect(result.mesh).toBeInstanceOf(THREE.Mesh)
    expect(result.glow).toBeInstanceOf(THREE.Mesh)
  })

  it('should add arrow and glow to scene', () => {
    const force = makeForce([105.5, 28.0], 'red')
    const result = createForceArrow(force, scene)

    expect(scene.children).toContain(result.mesh)
    expect(scene.children).toContain(result.glow)
  })

  it('should use red color (#C0392B) for red side forces', () => {
    const force = makeForce([105.5, 28.0], 'red')
    const result = createForceArrow(force, scene)

    const mat = result.mesh.material as THREE.MeshBasicMaterial
    expect(mat.color.getHex()).toBe(0xc0392b)
  })

  it('should use blue color (#2C5F7C) for blue side forces', () => {
    const force = makeForce([106.0, 28.5], 'blue')
    const result = createForceArrow(force, scene)

    const mat = result.mesh.material as THREE.MeshBasicMaterial
    expect(mat.color.getHex()).toBe(0x2c5f7c)
  })

  it('should have glow with transparent material', () => {
    const force = makeForce([105.5, 28.0], 'red')
    const result = createForceArrow(force, scene)

    const glowMat = result.glow.material as THREE.MeshBasicMaterial
    expect(glowMat.transparent).toBe(true)
    expect(glowMat.opacity).toBe(0.2)
  })

  it('should position arrow at correct world coordinates', () => {
    const lng = 105.5
    const lat = 28.0
    const force = makeForce([lng, lat], 'red')
    const result = createForceArrow(force, scene)

    const [expectedX, expectedZ] = defaultLngLatToWorldXY([lng, lat])
    expect(result.mesh.position.x).toBeCloseTo(expectedX, 0)
    expect(result.mesh.position.z).toBeCloseTo(expectedZ, 0)
  })

  it('should work with custom coordinate mapping', () => {
    const force = makeForce([10, 20], 'red')
    const customMap = vi.fn((_: LngLat) => [1000, 2000] as [number, number])

    const result = createForceArrow(force, scene, customMap)

    expect(result.mesh.position.x).toBe(1000)
    expect(result.mesh.position.z).toBe(2000)
    expect(customMap).toHaveBeenCalledWith([10, 20])
  })

  it('should use ConeGeometry for arrow mesh', () => {
    const force = makeForce([105.5, 28.0], 'red')
    const result = createForceArrow(force, scene)

    expect(result.mesh.geometry).toBeInstanceOf(THREE.ConeGeometry)
  })

  it('should use SphereGeometry for glow', () => {
    const force = makeForce([105.5, 28.0], 'red')
    const result = createForceArrow(force, scene)

    expect(result.glow.geometry).toBeInstanceOf(THREE.SphereGeometry)
  })
})

describe('defaultLngLatToWorldXY', () => {
  it('should map center to near origin', () => {
    const [x, z] = defaultLngLatToWorldXY([105.5, 28.0])
    // 中心点应接近 (0, 0)
    expect(Math.abs(x)).toBeLessThan(100)
    expect(Math.abs(z)).toBeLessThan(100)
  })

  it('should map west edge to negative x', () => {
    const [x, _] = defaultLngLatToWorldXY([104, 28])
    expect(x).toBeLessThan(-3000)
  })

  it('should map east edge to positive x', () => {
    const [x, _] = defaultLngLatToWorldXY([107, 28])
    expect(x).toBeGreaterThan(3000)
  })

  it('should map north edge to positive z', () => {
    const [_, z] = defaultLngLatToWorldXY([105.5, 27])
    expect(z).toBeGreaterThan(3000)
  })

  it('should map south edge to negative z', () => {
    const [_, z] = defaultLngLatToWorldXY([105.5, 29])
    expect(z).toBeLessThan(-3000)
  })
})
