import test from 'ava'
import io3d from '../build/3dio'

// get sceneStructure form id

test('Scene: get sceneStructure form id', t => {
  const id = '5a281187-475a-4613-8fa5-a2e92af9914d'
  return io3d.scene.getStructure(id)
    .then(io3d.scene.validateSceneStructure)
    .then(result => {
      t.is(result.isValid, true)
    })
})

// url from scene id

test('Scene: get url form id', t => {
  const id = '7078987a-d67c-4d01-bd7d-a3c4bb51244b'
  const url = io3d.scene.getViewerUrl({sceneId: id})
  t.is(url, 'https://spaces.archilogic.com/3d/!' + id)
})

// sceneStructure validation

test('Scene: test invalid type', t => {
  const sceneStructure = {
    type: 'blurb',
    x: 1,
    y: 2,
    z: 0
  }
  return io3d.scene.validateSceneStructure(sceneStructure)
    .then(result => {
      t.is(result.isValid, false)
    })
})

test('Scene: test NaN', t => {
  const sceneStructure = {
    type: 'wall',
    l: 'a',
    h: 1,
    w: 0.1
  }
  return io3d.scene.validateSceneStructure(sceneStructure)
    .then(result => {
      t.is(result.isValid, false)
    })
})

test('Scene: invalid children', t => {
  const sceneStructure = {
    type: 'wall',
    l: 2,
    h: 1,
    w: 0.1,
    id: "2335fa98-2c0c-4168-8cde-9b2347789029",
    x: 0,
    y: 0,
    z: 0,
    ry: 0,
    children: [
      {
        type: 'wall',
        l: 2,
        h: 1,
        w: 0.1
      }
    ]
  }
  return io3d.scene.validateSceneStructure(sceneStructure)
    .then(result => {
      t.is(result.isValid, false)
      t.is(result.errors[0].code, 7)
    })
})

test('Scene: test valid scene structure', t => {
  const sceneStructure = {
    type: 'wall',
    l: 2,
    h: 1,
    w: 0.1,
    x: 0,
    y: 0,
    z: 0,
    ry: 0,
    id: "a3ad7e08-66f9-40ce-a480-827220f8c52b",
    children: [
      {
        type: 'window',
        x: 0.8,
        y: 0.5,
        z: 0,
        ry: 0,
        l: 0.5,
        h: 1,
        id: "177f8aee-dbc6-4398-b9a7-f7b820eb9fa9"
      }
    ]
  }
  return io3d.scene.validateSceneStructure(sceneStructure)
    .then(result => {
      t.is(result.isValid, true)
    })
})

// sceneStructure normalization

test('Scene: valid types', t => {
  const sceneStructure = [
    { type: 'box'},
    { type: 'camera-bookmark'},
    { type: 'closet'},
    { type: 'curtain'},
    { type: 'door'},
    { type: 'floor'},
    { type: 'floorplan'},
    { type: 'group'},
    { type: 'interior'},
    { type: 'kitchen'},
    { type: 'level'},
    { type: 'object'},
    { type: 'plan'},
    { type: 'polybox'},
    { type: 'polyfloor'},
    { type: 'railing'},
    { type: 'stairs'},
    { type: 'tag'},
    { type: 'wall'},
    { type: 'window'}
  ]
  return io3d.scene.normalizeSceneStructure(sceneStructure)
    .then(result => {
      t.is(result.length, 20)
    })
})

test('Scene: fix invalid children', t => {
  const sceneStructure = {
    type: 'wall',
    l: 2,
    h: 1,
    w: 0.1,
    children: [
      {
        type: 'wall',
        l: 2,
        h: 1,
        w: 0.1
      }
    ]
  }
  return io3d.scene.normalizeSceneStructure(sceneStructure)
    .then(io3d.scene.validateSceneStructure)
    .then(result => {
      t.is(result.isValid, true)
    })
})

test('Scene: normalize simple scene structure array', t => {
  const sceneStructure = [
    {
      type: 'wall',
      l: 2,
      foo: 'bar'
    },
    {
      type: 'foo',
      l: 2
    }
  ]
  return io3d.scene.normalizeSceneStructure(sceneStructure)
    .then(result => {
      // invalid param removed
      t.true(!result[0].foo)
      // valid param still there
      t.true(result[0].type === 'wall')
      // invalid element removed
      t.true(!result[1])
  })
})

test('Scene: normalize nested scene structure object', t => {
  const sceneStructure = {
    type: 'wall',
    l: 2,
    foo: 'bar',
    children: [
      {
        type: 'group',
        l: 5
      },
      {
        type: 'window',
        l: 1,
        children: [
          {
            type: 'wall'
          }
        ],
        bar: 'foo'
      },
      {
        type: 'foo',
        l: 1
      }
    ]
  }
  return io3d.scene.normalizeSceneStructure(sceneStructure)
    .then(result => {
      // invalid param removed
      t.true(!result.foo)
      // children with invalid type removed
      t.true(result.children.length === 1)
      // invalid child removed
      t.true(result.children[0].children.length === 0)
  })
})

test('Scene: normalize numbers', t => {
  const sceneStructure = {
    type: 'wall',
    l: '2.12'
  }

  return io3d.scene.normalizeSceneStructure(sceneStructure)
    .then(result => {
      // invalid type adapted
      t.is(typeof result.l, 'number')
      // value preserved
      t.is(result.l, 2.12)
    })
})


test('Scene: normalize integers', t => {
  const sceneStructure = {
    type: 'kitchen',
    highCabinetLeft: '2.12'
  }

  return io3d.scene.normalizeSceneStructure(sceneStructure)
    .then(result => {
      // invalid type adapted
      t.is(typeof result.highCabinetLeft, 'number')
      // value preserved
      t.is(result.highCabinetLeft, 2)
    })
})