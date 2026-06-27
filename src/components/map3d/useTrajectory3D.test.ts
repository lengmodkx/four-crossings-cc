/**
 * useTrajectory3D 测试
 *
 * 验证 3D 行军轨迹线创建: 返回 THREE.Line 对象，坐标正确转换，
 * 颜色来自轨迹属性或自定义选项。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as THREE from 'three'
import { createTrajectory3D } from './useTrajectory3D'
import type { TrajectoryFeature, LngLat } from '@/data/types'

/**
 * 最小化 WebGL mock
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
    NEAREST: 0x2600, LINEAR: 0x2601, LESS: 0x0201,
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
    MAX_UNIFORM_BUFFER_BINDINGS: 0x8a2f,
    IMPLEMENTATION_COLOR_READ_FORMAT: 0x8b9b, IMPLEMENTATION_COLOR_READ_TYPE: 0x8b9a,
    TEXTURE_MAX_ANISOTROPY_EXT: 0x84fe,
    SAMPLES: 0x80a9,
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
  gl.checkFramebufferStatus = vi.fn(() => 0x8cd5)
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
    'stencilOpSeparate', 'stencilFuncSeparate',
  ].forEach(n => { gl[n] = noop })

  gl.canvas = null
  gl.drawingBufferWidth = 100
  gl.drawingBufferHeight = 100
  return gl
}

/** 创建 mock TrajectoryFeature */
function makeTraj(
  coords: LngLat[],
  color = '#C0392B',
  id = 'test-traj',
): TrajectoryFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coords,
    },
    properties: {
      id,
      force_id: 'force-1',
      segment_start: '1935-01-19T00:00:00+08:00',
      segment_end: '1935-01-25T00:00:00+08:00',
      phase: 'first-crossing',
      color,
      source: 'test',
    },
  }
}

describe('createTrajectory3D', () => {
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

  it('should return a THREE.Line object', () => {
    const traj = makeTraj([
      [105.5, 28.0],
      [105.6, 28.1],
      [105.7, 28.2],
    ])
    const line = createTrajectory3D(traj, scene)

    expect(line).toBeInstanceOf(THREE.Line)
    expect(line.geometry).toBeInstanceOf(THREE.BufferGeometry)
  })

  it('should add line to scene', () => {
    const traj = makeTraj([[105.5, 28.0], [106.0, 28.5]])
    const line = createTrajectory3D(traj, scene)

    expect(scene.children).toContain(line)
  })

  it('should use color from trajectory properties', () => {
    const traj = makeTraj([[105.5, 28.0], [106.0, 28.5]], '#2C5F7C')
    const line = createTrajectory3D(traj, scene)

    const mat = line.material as THREE.LineBasicMaterial
    expect(mat.color.getHex()).toBe(0x2c5f7c)
  })

  it('should allow overriding color via options', () => {
    const traj = makeTraj([[105.5, 28.0], [106.0, 28.5]], '#C0392B')
    const line = createTrajectory3D(traj, scene, undefined, undefined, { color: '#00FF00' })

    const mat = line.material as THREE.LineBasicMaterial
    expect(mat.color.getHex()).toBe(0x00ff00)
  })

  it('should use transparent material with opacity 0.8', () => {
    const traj = makeTraj([[105.5, 28.0], [106.0, 28.5]])
    const line = createTrajectory3D(traj, scene)

    const mat = line.material as THREE.LineBasicMaterial
    expect(mat.transparent).toBe(true)
    expect(mat.opacity).toBe(0.8)
  })

  it('should set vertex count equal to coordinate count', () => {
    const coords: LngLat[] = [
      [105.5, 28.0],
      [105.6, 28.1],
      [105.7, 28.2],
      [106.0, 28.5],
    ]
    const traj = makeTraj(coords)
    const line = createTrajectory3D(traj, scene)

    const posAttr = line.geometry.attributes.position
    expect(posAttr.count).toBe(4)
  })

  it('should apply height via getHeightFn', () => {
    const traj = makeTraj([[105.5, 28.0], [106.0, 28.5]])
    const heightFn = vi.fn(() => 50)

    const line = createTrajectory3D(traj, scene, undefined, heightFn)

    const posAttr = line.geometry.attributes.position
    const y0 = posAttr.getY(0)
    expect(y0).toBe(50)
    expect(heightFn).toHaveBeenCalled()
  })

  it('should apply height offset via options', () => {
    const traj = makeTraj([[105.5, 28.0], [106.0, 28.5]])
    const line = createTrajectory3D(traj, scene, undefined, () => 10, { heightOffset: 15 })

    const posAttr = line.geometry.attributes.position
    const y0 = posAttr.getY(0)
    expect(y0).toBe(25) // 10 + 15
  })

  it('should handle single point trajectory gracefully', () => {
    const traj = makeTraj([[105.5, 28.0]])
    const line = createTrajectory3D(traj, scene)

    expect(line).toBeInstanceOf(THREE.Line)
    expect(scene.children).toContain(line)
  })

  it('should set renderOrder to 1', () => {
    const traj = makeTraj([[105.5, 28.0], [106.0, 28.5]])
    const line = createTrajectory3D(traj, scene)

    expect(line.renderOrder).toBe(1)
  })
})
