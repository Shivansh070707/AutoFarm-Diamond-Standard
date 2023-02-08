Deploying Diamond scripts-
npx hardhat run scripts/initFunction.ts //update the arguments

Running Tests-
npx hardhat test

changes in autofarm facet w.r.t original autofarm contract-
{

original: function withdrawAll(uint256 \_pid) external nonReentrant{
withdraw(\_pid, type(uint256).max);
}
changed: function withdrawAll(uint256 \_pid) external {
withdraw(\_pid, type(uint256).max);
}
//withdraw and withdrawAll both are nonReentrant so it will throw error
}
