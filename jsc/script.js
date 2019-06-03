pxt.setAppTarget(pxtTargetBundle)
pxt.setHwVariant("vm")

const r = pxt.simpleCompile(
{
  "README.md": " ",
  "main.blocks": "<xml xmlns=\"http://www.w3.org/1999/xhtml\">\n  <variables>\n    <variable type=\"SpriteKind\" id=\"[V)m-^dXzqry7BlQ=YAz\">0Player</variable>\n    <variable type=\"SpriteKind\" id=\"+za8=+yND3pi[057Hk+t\">1Projectile</variable>\n    <variable type=\"SpriteKind\" id=\"[-)Oi~|=(42TGTT_n~)W\">2Enemy</variable>\n    <variable type=\"SpriteKind\" id=\"IP1Mx(RADw+r8b{2PVY9\">3Food</variable>\n    <variable type=\"\" id=\"XmD=#L7__(LfKnpb6!a)\">projectile</variable>\n    <variable type=\"\" id=\"7Im6;0z3nrVJ,1ca-,AT\">ship</variable>\n    <variable type=\"\" id=\"kMyT|!p03@ATla0KsQQM\">asteroids</variable>\n  </variables>\n  <block type=\"pxt-on-start\" x=\"0\" y=\"0\">\n    <statement name=\"HANDLER\">\n      <block type=\"variables_set\">\n        <field name=\"VAR\" id=\"kMyT|!p03@ATla0KsQQM\" variabletype=\"\">asteroids</field>\n        <value name=\"VALUE\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">0</field>\n          </shadow>\n          <block type=\"lists_create_with\" inline=\"false\">\n            <mutation items=\"6\"></mutation>\n            <value name=\"ADD0\">\n              <block type=\"image_picker\">\n                <field name=\"image\">sprites.space.spaceSmallAsteroid1</field>\n              </block>\n            </value>\n            <value name=\"ADD1\">\n              <block type=\"image_picker\">\n                <field name=\"image\">sprites.space.spaceSmallAsteroid0</field>\n              </block>\n            </value>\n            <value name=\"ADD2\">\n              <block type=\"image_picker\">\n                <field name=\"image\">sprites.space.spaceAsteroid0</field>\n              </block>\n            </value>\n            <value name=\"ADD3\">\n              <block type=\"image_picker\">\n                <field name=\"image\">sprites.space.spaceAsteroid1</field>\n              </block>\n            </value>\n            <value name=\"ADD4\">\n              <block type=\"image_picker\">\n                <field name=\"image\">sprites.space.spaceAsteroid4</field>\n              </block>\n            </value>\n            <value name=\"ADD5\">\n              <block type=\"image_picker\">\n                <field name=\"image\">sprites.space.spaceAsteroid3</field>\n              </block>\n            </value>\n          </block>\n        </value>\n        <next>\n          <block type=\"variables_set\">\n            <field name=\"VAR\" id=\"7Im6;0z3nrVJ,1ca-,AT\" variabletype=\"\">ship</field>\n            <value name=\"VALUE\">\n              <shadow type=\"math_number\">\n                <field name=\"NUM\">0</field>\n              </shadow>\n              <block type=\"spritescreate\">\n                <value name=\"img\">\n                  <shadow type=\"screen_image_picker\"></shadow>\n                  <block type=\"image_picker\">\n                    <field name=\"image\">sprites.space.spaceRedShip</field>\n                  </block>\n                </value>\n                <value name=\"kind\">\n                  <shadow type=\"spritetype\">\n                    <field name=\"MEMBER\">Player</field>\n                  </shadow>\n                </value>\n              </block>\n            </value>\n            <next>\n              <block type=\"spritesetsetflag\">\n                <field name=\"flag\">SpriteFlag.StayInScreen</field>\n                <value name=\"sprite\">\n                  <block type=\"variables_get\">\n                    <field name=\"VAR\" id=\"7Im6;0z3nrVJ,1ca-,AT\" variabletype=\"\">ship</field>\n                  </block>\n                </value>\n                <value name=\"on\">\n                  <shadow type=\"toggleOnOff\">\n                    <field name=\"on\">true</field>\n                  </shadow>\n                </value>\n                <next>\n                  <block type=\"Sprite_blockCombine_set\">\n                    <field name=\"property\">Sprite.bottom@set</field>\n                    <value name=\"mySprite\">\n                      <block type=\"variables_get\">\n                        <field name=\"VAR\" id=\"7Im6;0z3nrVJ,1ca-,AT\" variabletype=\"\">ship</field>\n                      </block>\n                    </value>\n                    <value name=\"value\">\n                      <shadow type=\"math_number\">\n                        <field name=\"NUM\">120</field>\n                      </shadow>\n                    </value>\n                    <next>\n                      <block type=\"game_control_sprite\">\n                        <mutation _expanded=\"2\" _input_init=\"true\"></mutation>\n                        <value name=\"sprite\">\n                          <shadow type=\"variables_get\">\n                            <field name=\"VAR\" id=\"7Im6;0z3nrVJ,1ca-,AT\" variabletype=\"\">ship</field>\n                          </shadow>\n                        </value>\n                        <value name=\"vx\">\n                          <shadow type=\"math_number\">\n                            <field name=\"NUM\">100</field>\n                          </shadow>\n                        </value>\n                        <value name=\"vy\">\n                          <shadow type=\"math_number\">\n                            <field name=\"NUM\">100</field>\n                          </shadow>\n                        </value>\n                        <next>\n                          <block type=\"hudSetLife\">\n                            <value name=\"value\">\n                              <shadow type=\"math_number\">\n                                <field name=\"NUM\">3</field>\n                              </shadow>\n                            </value>\n                            <next>\n                              <block type=\"particlesStartScreenAnimation\">\n                                <mutation _expanded=\"0\" _input_init=\"false\"></mutation>\n                                <field name=\"effect\">effects.starField</field>\n                              </block>\n                            </next>\n                          </block>\n                        </next>\n                      </block>\n                    </next>\n                  </block>\n                </next>\n              </block>\n            </next>\n          </block>\n        </next>\n      </block>\n    </statement>\n  </block>\n  <block type=\"spritesoverlap\" x=\"604\" y=\"0\">\n    <value name=\"HANDLER_DRAG_PARAM_sprite\">\n      <shadow type=\"argument_reporter_custom\">\n        <mutation typename=\"Sprite\"></mutation>\n        <field name=\"VALUE\">sprite</field>\n      </shadow>\n    </value>\n    <value name=\"kind\">\n      <shadow type=\"spritetype\">\n        <field name=\"MEMBER\">Player</field>\n      </shadow>\n    </value>\n    <value name=\"HANDLER_DRAG_PARAM_otherSprite\">\n      <shadow type=\"argument_reporter_custom\">\n        <mutation typename=\"Sprite\"></mutation>\n        <field name=\"VALUE\">otherSprite</field>\n      </shadow>\n    </value>\n    <value name=\"otherKind\">\n      <shadow type=\"spritetype\">\n        <field name=\"MEMBER\">Enemy</field>\n      </shadow>\n    </value>\n    <statement name=\"HANDLER\">\n      <block type=\"camerashake\">\n        <value name=\"amplitude\">\n          <shadow type=\"math_number_minmax\">\n            <mutation min=\"1\" max=\"8\" label=\"Number\"></mutation>\n            <field name=\"SLIDER\">4</field>\n          </shadow>\n        </value>\n        <value name=\"duration\">\n          <shadow type=\"timePicker\">\n            <field name=\"ms\">500</field>\n          </shadow>\n        </value>\n        <next>\n          <block type=\"spritedestroy\">\n            <mutation _expanded=\"1\" _input_init=\"true\"></mutation>\n            <field name=\"effect\">effects.disintegrate</field>\n            <value name=\"sprite\">\n              <block type=\"argument_reporter_custom\">\n                <mutation typename=\"Sprite\"></mutation>\n                <field name=\"VALUE\">otherSprite</field>\n              </block>\n            </value>\n            <next>\n              <block type=\"startEffectOnSprite\">\n                <mutation _expanded=\"1\" _input_init=\"true\"></mutation>\n                <field name=\"effect\">effects.fire</field>\n                <value name=\"sprite\">\n                  <block type=\"argument_reporter_custom\">\n                    <mutation typename=\"Sprite\"></mutation>\n                    <field name=\"VALUE\">sprite</field>\n                  </block>\n                </value>\n                <value name=\"duration\">\n                  <shadow type=\"timePicker\">\n                    <field name=\"ms\">200</field>\n                  </shadow>\n                </value>\n                <next>\n                  <block type=\"hudChangeLifeBy\">\n                    <value name=\"value\">\n                      <shadow type=\"math_number\">\n                        <field name=\"NUM\">-1</field>\n                      </shadow>\n                    </value>\n                  </block>\n                </next>\n              </block>\n            </next>\n          </block>\n        </next>\n      </block>\n    </statement>\n  </block>\n  <block type=\"spritesoverlap\" x=\"1352\" y=\"0\">\n    <value name=\"HANDLER_DRAG_PARAM_sprite\">\n      <shadow type=\"argument_reporter_custom\">\n        <mutation typename=\"Sprite\"></mutation>\n        <field name=\"VALUE\">sprite</field>\n      </shadow>\n    </value>\n    <value name=\"kind\">\n      <shadow type=\"spritetype\">\n        <field name=\"MEMBER\">Projectile</field>\n      </shadow>\n    </value>\n    <value name=\"HANDLER_DRAG_PARAM_otherSprite\">\n      <shadow type=\"argument_reporter_custom\">\n        <mutation typename=\"Sprite\"></mutation>\n        <field name=\"VALUE\">otherSprite</field>\n      </shadow>\n    </value>\n    <value name=\"otherKind\">\n      <shadow type=\"spritetype\">\n        <field name=\"MEMBER\">Enemy</field>\n      </shadow>\n    </value>\n    <statement name=\"HANDLER\">\n      <block type=\"spritedestroy\">\n        <mutation _expanded=\"0\" _input_init=\"false\"></mutation>\n        <value name=\"sprite\">\n          <block type=\"argument_reporter_custom\">\n            <mutation typename=\"Sprite\"></mutation>\n            <field name=\"VALUE\">sprite</field>\n          </block>\n        </value>\n        <next>\n          <block type=\"spritedestroy\">\n            <mutation _expanded=\"1\" _input_init=\"true\"></mutation>\n            <field name=\"effect\">effects.disintegrate</field>\n            <value name=\"sprite\">\n              <block type=\"argument_reporter_custom\">\n                <mutation typename=\"Sprite\"></mutation>\n                <field name=\"VALUE\">otherSprite</field>\n              </block>\n            </value>\n            <next>\n              <block type=\"hudChangeScoreBy\">\n                <value name=\"value\">\n                  <shadow type=\"math_number\">\n                    <field name=\"NUM\">1</field>\n                  </shadow>\n                </value>\n              </block>\n            </next>\n          </block>\n        </next>\n      </block>\n    </statement>\n  </block>\n  <block type=\"keyonevent\" x=\"0\" y=\"839\">\n    <field name=\"button\">controller.A</field>\n    <field name=\"event\">ControllerButtonEvent.Pressed</field>\n    <statement name=\"HANDLER\">\n      <block type=\"variables_set\">\n        <field name=\"VAR\" id=\"XmD=#L7__(LfKnpb6!a)\" variabletype=\"\">projectile</field>\n        <value name=\"VALUE\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">0</field>\n          </shadow>\n          <block type=\"spritescreateprojectilefromsprite\">\n            <value name=\"img\">\n              <shadow type=\"screen_image_picker\">\n                <field name=\"img\">img`\n. . . . . . . . \n. . . . . . . . \n. . . . . . . . \n. . . . . . . . \n. . . 7 7 . . . \n. . . 7 7 . . . \n. . . 7 7 . . . \n. . . 7 7 . . . \n`\n                </field>\n              </shadow>\n            </value>\n            <value name=\"sprite\">\n              <shadow type=\"variables_get\">\n                <field name=\"VAR\" id=\"7Im6;0z3nrVJ,1ca-,AT\" variabletype=\"\">ship</field>\n              </shadow>\n            </value>\n            <value name=\"vx\">\n              <shadow type=\"spriteSpeedPicker\">\n                <field name=\"speed\">0</field>\n              </shadow>\n            </value>\n            <value name=\"vy\">\n              <shadow type=\"spriteSpeedPicker\">\n                <field name=\"speed\">-140</field>\n              </shadow>\n            </value>\n          </block>\n        </value>\n        <next>\n          <block type=\"mixer_play_sound\">\n            <field name=\"sound\">music.baDing</field>\n            <next>\n              <block type=\"startEffectOnSprite\">\n                <mutation _expanded=\"1\" _input_init=\"true\"></mutation>\n                <field name=\"effect\">effects.coolRadial</field>\n                <value name=\"sprite\">\n                  <block type=\"variables_get\">\n                    <field name=\"VAR\" id=\"XmD=#L7__(LfKnpb6!a)\" variabletype=\"\">projectile</field>\n                  </block>\n                </value>\n                <value name=\"duration\">\n                  <shadow type=\"timePicker\">\n                    <field name=\"ms\">100</field>\n                  </shadow>\n                </value>\n              </block>\n            </next>\n          </block>\n        </next>\n      </block>\n    </statement>\n  </block>\n  <block type=\"gameinterval\" x=\"838\" y=\"839\">\n    <value name=\"period\">\n      <shadow type=\"timePicker\">\n        <field name=\"ms\">500</field>\n      </shadow>\n    </value>\n    <statement name=\"HANDLER\">\n      <block type=\"variables_set\">\n        <field name=\"VAR\" id=\"XmD=#L7__(LfKnpb6!a)\" variabletype=\"\">projectile</field>\n        <value name=\"VALUE\">\n          <shadow type=\"math_number\">\n            <field name=\"NUM\">0</field>\n          </shadow>\n          <block type=\"spritescreateprojectilefromside\">\n            <value name=\"img\">\n              <shadow type=\"screen_image_picker\"></shadow>\n              <block type=\"lists_index_get\">\n                <value name=\"LIST\">\n                  <block type=\"variables_get\">\n                    <field name=\"VAR\" id=\"kMyT|!p03@ATla0KsQQM\" variabletype=\"\">asteroids</field>\n                  </block>\n                </value>\n                <value name=\"INDEX\">\n                  <shadow type=\"math_number\">\n                    <field name=\"NUM\">0</field>\n                  </shadow>\n                  <block type=\"device_random\">\n                    <value name=\"min\">\n                      <shadow type=\"math_number\">\n                        <field name=\"NUM\">0</field>\n                      </shadow>\n                    </value>\n                    <value name=\"limit\">\n                      <block type=\"math_arithmetic\">\n                        <field name=\"OP\">MINUS</field>\n                        <value name=\"A\">\n                          <shadow type=\"math_number\">\n                            <field name=\"NUM\">0</field>\n                          </shadow>\n                          <block type=\"lists_length\">\n                            <value name=\"VALUE\">\n                              <block type=\"variables_get\">\n                                <field name=\"VAR\" id=\"kMyT|!p03@ATla0KsQQM\" variabletype=\"\">asteroids</field>\n                              </block>\n                            </value>\n                          </block>\n                        </value>\n                        <value name=\"B\">\n                          <shadow type=\"math_number\">\n                            <field name=\"NUM\">1</field>\n                          </shadow>\n                        </value>\n                      </block>\n                    </value>\n                  </block>\n                </value>\n              </block>\n            </value>\n            <value name=\"vx\">\n              <shadow type=\"spriteSpeedPicker\">\n                <field name=\"speed\">0</field>\n              </shadow>\n            </value>\n            <value name=\"vy\">\n              <shadow type=\"spriteSpeedPicker\">\n                <field name=\"speed\">75</field>\n              </shadow>\n            </value>\n          </block>\n        </value>\n        <next>\n          <block type=\"spritesetkind\">\n            <value name=\"sprite\">\n              <block type=\"variables_get\">\n                <field name=\"VAR\" id=\"XmD=#L7__(LfKnpb6!a)\" variabletype=\"\">projectile</field>\n              </block>\n            </value>\n            <value name=\"kind\">\n              <shadow type=\"spritetype\">\n                <field name=\"MEMBER\">Enemy</field>\n              </shadow>\n            </value>\n            <next>\n              <block type=\"Sprite_blockCombine_set\">\n                <field name=\"property\">Sprite.x@set</field>\n                <value name=\"mySprite\">\n                  <block type=\"variables_get\">\n                    <field name=\"VAR\" id=\"XmD=#L7__(LfKnpb6!a)\" variabletype=\"\">projectile</field>\n                  </block>\n                </value>\n                <value name=\"value\">\n                  <block type=\"device_random\">\n                    <value name=\"min\">\n                      <shadow type=\"math_number\">\n                        <field name=\"NUM\">10</field>\n                      </shadow>\n                    </value>\n                    <value name=\"limit\">\n                      <shadow type=\"math_number\">\n                        <field name=\"NUM\">150</field>\n                      </shadow>\n                    </value>\n                  </block>\n                </value>\n              </block>\n            </next>\n          </block>\n        </next>\n      </block>\n    </statement>\n  </block>\n</xml>",
  "main.ts": "sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {\n    scene.cameraShake(4, 500)\n    otherSprite.destroy(effects.disintegrate)\n    sprite.startEffect(effects.fire, 200)\n    info.changeLifeBy(-1)\n})\nsprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {\n    sprite.destroy()\n    otherSprite.destroy(effects.disintegrate)\n    info.changeScoreBy(1)\n})\ncontroller.A.onEvent(ControllerButtonEvent.Pressed, function () {\n    projectile = sprites.createProjectileFromSprite(img`\n        . . . . . . . .\n        . . . . . . . .\n        . . . . . . . .\n        . . . . . . . .\n        . . . 7 7 . . .\n        . . . 7 7 . . .\n        . . . 7 7 . . .\n        . . . 7 7 . . .\n    `, ship, 0, -140)\n    music.baDing.play()\n    projectile.startEffect(effects.coolRadial, 100)\n})\nlet projectile: Sprite = null\nlet ship: Sprite = null\nlet asteroids = [sprites.space.spaceSmallAsteroid1, sprites.space.spaceSmallAsteroid0, sprites.space.spaceAsteroid0, sprites.space.spaceAsteroid1, sprites.space.spaceAsteroid4, sprites.space.spaceAsteroid3]\nscene.setBackgroundColor(3)\nship = sprites.create(sprites.space.spaceRedShip, SpriteKind.Player)\nship.setFlag(SpriteFlag.StayInScreen, true)\nship.bottom = 120\ncontroller.moveSprite(ship, 100, 100)\ninfo.setLife(3)\neffects.starField.startScreenEffect()\ngame.onUpdateInterval(500, function () {\n    projectile = sprites.createProjectileFromSide(asteroids[Math.randomRange(0, asteroids.length - 1)], 0, 75)\n    projectile.setKind(SpriteKind.Enemy)\n    projectile.x = Math.randomRange(10, 150)\n})\n",
  "pxt.json": "{\n    \"name\": \"space destroyer\",\n    \"dependencies\": {\n        \"device\": \"*\"\n    },\n    \"description\": \"\",\n    \"files\": [\n        \"main.blocks\",\n        \"main.ts\",\n        \"README.md\"\n    ],\n    \"preferredEditor\": \"tsprj\",\n    \"targetVersions\": {\n        \"branch\": \"v0.12.3\",\n        \"tag\": \"v0.12.3\",\n        \"commits\": \"https://github.com/microsoft/pxt-arcade/commits/52a6942051a563343d3c374b6c8f8f89b7168bb6\",\n        \"target\": \"0.12.3\",\n        \"pxt\": \"5.17.14\"\n    }\n}"
}, true)
console.log(JSON.stringify(r,null,1))
