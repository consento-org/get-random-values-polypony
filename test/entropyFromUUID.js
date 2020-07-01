const test = require('fresh-tape')
const samples = [
  // Generated using: uuidjs (npm package)
  { uuid: 'c2749765-9a35-46dc-8f87-159d5fc3d114', big: { low: 3262420837, high: 1606668564 } },
  { uuid: '18e1557f-17b6-422e-91da-614df558c359', big: { low: 417420671, high: 4116235097 } },
  { uuid: '43b4e94c-a9d4-4517-a3c8-217fa227d183', big: { low: 1135929676, high: 2720518531 } },
  { uuid: '969d8d65-ef0a-49c3-a51a-f60244912778', big: { low: 2526907749, high: 1150363512 } },
  { uuid: '2f712397-f78b-457d-b11a-0ba3c8e7b843', big: { low: 795943831, high: 3370629187 } },
  { uuid: '83cf9095-1c57-4b4d-a509-d2ca6b041cbc', big: { low: 2211418261, high: 1795431612 } },
  { uuid: '581ee557-e90f-468f-86fd-68eb0873f7c0', big: { low: 1478419799, high: 141817792 } },
  { uuid: '084d1a9b-1669-4d96-b94c-573d24af7bdd', big: { low: 139270811, high: 615480285 } },
  { uuid: 'ddf2031c-8717-4f0f-9b59-449d1d84612e', big: { low: 3723625244, high: 495214894 } },
  { uuid: 'bd893bcb-4f0f-4377-ab27-77a055131c12', big: { low: 3179887563, high: 1427315730 } },
  // Generated using: https://www.uuidgenerator.net/version4
  { uuid: 'f6846735-3051-4637-b41e-d4eb963b6c8f', big: { low: 4135872309, high: 2520476815 } },
  { uuid: 'dba4d922-fed4-4bf9-9b96-0aae91da0fdc', big: { low: 3685013794, high: 2446987228 } },
  { uuid: '45144009-209e-4e91-9ea5-c63c7fe7b02a', big: { low: 1158955017, high: 2145890346 } },
  { uuid: '9cd6a177-82cd-4252-80ee-b4744c5e7999', big: { low: 2631311735, high: 1281259929 } },
  { uuid: '2acba38a-31f1-4f44-b76d-461bb6dc40f6', big: { low: 717988746, high: 3067887862 } },
  { uuid: '37cc1d04-9878-43bc-a976-4eb0254971dd', big: { low: 936123652, high: 625570269 } },
  { uuid: 'f38b6b46-1d3f-4ae9-a6f4-15f3a1f37bca', big: { low: 4086000454, high: 2717088714 } },
  { uuid: '0acccf21-c357-4999-a8ae-8b63512431a1', big: { low: 181194529, high: 1361326497 } },
  { uuid: '45724a0e-8299-48e5-a34a-793574057f9b', big: { low: 1165117966, high: 1946517403 } },
  { uuid: '6a77d1fa-dd2f-43ba-8fde-477924a803fc', big: { low: 1786237434, high: 614990844 } },
  // Generated using: https://www.guidgenerator.com/online-guid-generator.aspx
  { uuid: 'fc754800-9cd8-4864-af52-2895b6109d51', big: { low: 4235544576, high: 3054542161 } },
  { uuid: '2fb4209a-ef81-4b54-b68e-1494e213af45', big: { low: 800333978, high: 3792940869 } },
  { uuid: '4f5f30b8-ccbc-44d1-87d1-718719362c70', big: { low: 1331638456, high: 422980720 } },
  { uuid: '7bf9f575-6c21-4ffb-a2e3-fbbc7e133221', big: { low: 2079978869, high: 2115187233 } },
  { uuid: 'aafc4f0f-1b05-452e-b9bd-a9c6d8f7dfaf', big: { low: 2868662031, high: 3640123311 } },
  { uuid: '056fc65c-f478-4403-98bd-337487645b6c', big: { low: 91211356, high: 2271501164 } },
  { uuid: 'a16131b9-d775-4553-951b-17b6013b3286', big: { low: 2707501497, high: 20656774 } },
  { uuid: 'e3ad318e-4342-4256-86ae-1bc996595651', big: { low: 3819778446, high: 2522437201 } },
  { uuid: '49b1e9ff-6533-4cad-83b1-24f90acf1a93', big: { low: 1236396543, high: 181344915 } },
  { uuid: '5dd56149-d2c3-439d-a9d9-85e8b0224df4', big: { low: 1574265161, high: 2955038196 } }
]
const entropyFromUUID = require('../entropyFromUUID')

test('getting entropy from sample data', function (t) {
  samples.forEach(function (sample) {
    t.deepEqual(entropyFromUUID(sample.uuid), sample.big, sample.uuid)
  })
  t.end()
})
