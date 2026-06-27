import { describe, it, expect } from 'vitest'
import { COLORS, FONTS } from './variables'

describe('ancient map color palette (§5.1)', () => {
  it('should define background paper color as #F2E8D0 (军图米白)', () => {
    expect(COLORS.bgPaper).toBe('#F2E8D0')
  })

  it('should define cinnabar red as #C0392B for red army (朱砂红)', () => {
    expect(COLORS.accentRed).toBe('#C0392B')
  })

  it('should define steel blue as #2C5F7C for enemy army (钢蓝)', () => {
    expect(COLORS.accentBlue).toBe('#2C5F7C')
  })
})
